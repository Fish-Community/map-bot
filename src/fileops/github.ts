import config, { gamemodePaths } from "../config.js";
import { Octokit } from "@octokit/rest";
import { Attachment } from "discord.js";
import { crash, fail, filenameRegex, Gamemode, validateFile } from "../utils.js";

const octokit = new Octokit({
	auth: config.github.key,
});
/***
 * wrapper for getFileList(), returns a markdown formatted string listing file information
 */
export async function getFileListClean(gamemode: string) {
	//TODO escape markdown
	return (await getFileList(gamemode)).map(file => {
		if (file.download_url) return `- [${file.name}](${file.download_url})`;
		else return `- ${file.name}`;
	}).join("\n");
}
/**
 * returns filedata for every file found at path
 */
async function getFileList(path = ''): Promise<{ name: string, download_url: string | null, sha: string | null }[]> {
	const { data: repoContents } = await octokit.repos.getContent({
		owner: config.github.owner,
		repo: config.github.repo,
		path: path,
		ref: config.github.branch,
	});
	if (!Array.isArray(repoContents)) crash(`Unexpected GH API response`);
	const files = await Promise.all(repoContents.map(async file => {
		if (file.type === 'dir') {
			return [{ name: "INVALID_TYPE_FOLDER", download_url: null, sha: null }]
		} else {
			return [{ name: file.name, download_url: file.download_url, sha: file.sha }];
		}
	}));
	return files.flat();
}
/**
 * Fetches file info from the github repository given a filename
 */
async function getFile(gamemode: Gamemode, filename: string) {
	const owner = config.github.owner;
	const repo = config.github.repo
	const path = `${gamemodePaths[gamemode]}/${filename}`;
	const branch = config.github.branch;
	const res = await octokit.rest.repos.getContent({ owner, repo, path, ref: branch })
		.catch(() => fail(`File not found`));
	const fileData = Array.isArray(res.data) ? res.data[0] : res.data;
	if (fileData.type !== 'file' || !fileData.sha) fail(`File not found`);
	return { name: fileData.name, download_url: fileData.download_url, sha: fileData.sha };
}
async function downloadFile(url: string): Promise<Buffer> {
	let res = await fetch(url);
	let arrayRes = await res.arrayBuffer();
	return Buffer.from(arrayRes);
}
/**
 * deletes a file from the github repository
 */
export async function deleteFile(gamemode: Gamemode, filename: string): Promise<void> {
	if (!filenameRegex.test(filename))
		fail(`Invalid file name. Filenames must be alphanumeric and end with \`.msav\`.`);
	const fileSha = (
		await getFile(gamemode, filename)
			.catch(() => fail(`Unknown map \`${filename}\`. Make sure the filename is spelled correctly.`))
	).sha ?? fail(`Failed to fetch file information`);
	await octokit.rest.repos.deleteFile({
		owner: config.github.owner,
		repo: config.github.repo,
		path: gamemodePaths[gamemode] + "/" + filename,
		message: `Automated Deletion ${filename}`,
		sha: fileSha,
		branch: config.github.branch
	});
	console.log(`File deleted ${filename}`);
}
/**
 * Upload a discord attachment to github
 */
export async function addFileAttached(file: Attachment, gamemode: Gamemode, filename: string) {
	if (!filenameRegex.test(filename))
		fail(`Invalid file name. Filenames must be alphanumeric and end with \`.msav\`.`);
	const fileStatus = await getFile(gamemode, filename).catch(() => null);
	if(fileStatus != null) fail(`File \`${filename}\` already exists. If you want to overwrite this file, please use \`/update_map\`.`);
	let data = await downloadFile(file.url);
	await validateFile(data);
	await addFileBuffered(data, gamemode, filename);
}
/**
 * Uploads buffered data to github
 */
export async function addFileBuffered(data: Buffer, gamemode: Gamemode, filename: string) {
	let sha: string | undefined;
	try {
		sha = (await getFile(gamemode, filename)).sha;
		console.info(`Updating file ${filename}`);
	} catch {
		console.info(`Creating new file ${filename}`);
		sha = undefined;
	}

	await octokit.repos.createOrUpdateFileContents({
		owner: config.github.owner,
		repo: config.github.repo,
		path: gamemodePaths[gamemode] + "/" + filename,
		message: `Automatic Upload ${filename}`,
		branch: config.github.branch,
		content: data.toString('base64'),
		sha,
	});
	console.log(`Uploaded ${filename} to server`);
}
/**
 * Addmap but required to override a exsisting file 
 */
export async function updateFileAttached(file: Attachment, gamemode: Gamemode, filename: string): Promise<void> {
	if (!filenameRegex.test(filename))
		fail(`Invalid file name. Filenames must be alphanumeric and end with \`.msav\`.`);
	const data = await downloadFile(file.url);
	await validateFile(data);
	await getFile(gamemode, filename).catch(() =>
		fail(`Unknown map \`${filename}\`. Make sure the filename is spelled correctly. If this is a new map, please upload it with \`/add_map\`.`)
	);
	await addFileBuffered(data, gamemode, filename);
}
/***
 * Alter a github file's name
 */
export async function renameFile(gamemode: Gamemode, oldName: string, newName: string) {
	if (!filenameRegex.test(newName))
		fail(`Invalid file name. Filenames must be alphanumeric and end with \`.msav\`.`);
	if (!filenameRegex.test(oldName))
		fail(`Invalid file name. Filenames must be alphanumeric and end with \`.msav\`.`);
	if(newName == oldName)
		fail(`Filenames must be different.`);
	let res = await getFile(gamemode, oldName).catch(() =>
		fail(`Unknown map \`${oldName}\`. Make sure the filename is spelled correctly.`)
	);
	if (!res.download_url) fail(`Download URL missing`);
	let contents = await downloadFile(res.download_url);
	await addFileBuffered(contents, gamemode, newName);
	await deleteFile(gamemode, oldName);
}
