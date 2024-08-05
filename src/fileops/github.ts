import config, { gamemodePaths } from "../config.js";
import { Octokit } from "@octokit/rest";
import { Attachment } from "discord.js";
import { crash, fail, filenameRegex, Gamemode } from "../utils.js";

const octokit = new Octokit({
    auth: config.github.key,
});
/***
 * wrapper for getFileList(), returns a markdown formatted string listing file information
 */
export async function getFileListClean(gamemode: string){
    //TODO escape markdown
    return (await getFileList(gamemode)).map(file => {
        if(file.download_url) return `- [${file.name}](${file.download_url})`;
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
    if(!Array.isArray(repoContents)) crash(`Unexpected GH API response`);
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
async function getFile(gamemode: Gamemode, filename: string){
    const owner = config.github.owner;
    const repo = config.github.repo
    const path = `${gamemodePaths[gamemode]}/${filename}`;
    const branch = config.github.branch;
    const res = await octokit.rest.repos.getContent({ owner, repo, path, ref: branch });
    const fileData = Array.isArray(res.data) ? res.data[0] : res.data;
    if (fileData.type !== 'file' || !fileData.sha) fail(`File not found (SHA)`);
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
    if (!/^[^/\\]*\.msav$/.test(filename)) fail(`Map files cannot include "\\" or "/" and must end in ".msav"`)
    let fileSha = (await getFile(gamemode, filename))?.sha ?? fail(`Failed to fetch file information`);
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
        fail(`Invalid file name. Filenames must be alphanumeric and only use letters.`);
    let data = await downloadFile(file.url);
    await addFileBuffered(data, gamemode, filename);
}
/**
 * Uploads buffered data to github
 */
export async function addFileBuffered(data: Buffer, gamemode: Gamemode, filename: string) {
    let sha:string | undefined;
    try {
        sha = (await getFile(gamemode,filename)).sha;
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
    if(!filenameRegex.test(filename)) fail(`Invalid file name. Filenames must be alphanumeric and only use letters.`);
    if(!await getFile(gamemode, filename)) fail(`Unknown map ${filename}, if this is a new map, please upload it with /add_map`);
    await addFileAttached(file, gamemode, filename);
}
/***
 * Alter a github file's name
 */
export async function renameFile(gamemode: Gamemode, oldName: string, newName: string) {
    if(!filenameRegex.test(newName)) fail(`Invalid file name. Filenames must be alphanumeric and only use letters.`);
    if(!filenameRegex.test(oldName)) fail(`Invalid file name. Filenames must be alphanumeric and only use letters.`);
    let res = await getFile(gamemode, oldName);
    if(!res.download_url) fail(`Download URL missing`);
    let contents = await downloadFile(res.download_url);
    await addFileBuffered(contents, gamemode, newName);
    await deleteFile(gamemode, oldName);
}
