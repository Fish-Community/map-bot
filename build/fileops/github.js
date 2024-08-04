import config from "../../config.json" assert { type: 'json' };
import { Octokit } from "@octokit/rest";
import { Gamemode } from "../utils/mindustryTypes.js";
const octokit = new Octokit({
    auth: config.github.key,
});
/***
 * wrapper for getFileList(), returns a markdown formatted string listing file information
 */
export async function getFileListClean(gamemode) {
    let rawData = await getFileList(gamemode);
    let buffer = "";
    for (let Data of rawData) {
        if (Data.download_url) {
            buffer += `- [${Data.name}](${Data.download_url})\n`;
        }
        else {
            buffer += `- ${Data.name}\n`;
        }
    }
    return (buffer);
}
/**
 * returns filedata for every file found at path
 */
async function getFileList(path = '') {
    try {
        const { data: repoContents } = await octokit.repos.getContent({
            owner: config.github.owner,
            repo: config.github.repo,
            path: path,
            ref: config.github.branch,
        });
        if (Array.isArray(repoContents)) {
            const files = await Promise.all(repoContents.map(async (file) => {
                if (file.type === 'dir') {
                    return [{ name: "INVALID_TYPE_FOLDER", download_url: null, sha: null }];
                }
                else {
                    return [{ name: file.name, download_url: file.download_url, sha: file.sha }];
                }
            }));
            return files.flat();
        }
        else {
            throw new Error('Error reading structure of repository contents');
        }
    }
    catch (e) {
        throw e;
    }
}
/**
 * Fetches file info from the github repository given a filename
 */
async function getFile(gamemode, filename) {
    try {
        if (!config.github.paths.hasOwnProperty(gamemode)) {
            throw new Error(`Invalid gamemode ${gamemode}`);
        }
        const owner = config.github.owner;
        const repo = config.github.repo;
        const path = Gamemode[gamemode] + "/" + filename;
        const branch = config.github.branch;
        const res = await octokit.rest.repos.getContent({ owner, repo, path, ref: branch });
        const fileData = Array.isArray(res.data) ? res.data[0] : res.data;
        if (fileData.type !== 'file' || !fileData.sha) {
            throw new Error(`File not found (SHA)`);
        }
        return { name: fileData.name, download_url: fileData.download_url, sha: fileData.sha };
    }
    catch (e) {
        throw e;
    }
}
async function getFileContents(url) {
    let res = await fetch(url);
    let arrayRes = await res.arrayBuffer();
    return Buffer.from(arrayRes);
}
/**
 * deletes a file from the github repository
 */
export async function deleteFile(gamemode, filename) {
    try {
        if (!/^[^/\\]*\.msav$/.test(filename))
            throw new Error(`Map files cannot include \"\\\" or \"/\" and must end in \".msav\"`);
        let file = await getFile(gamemode, filename);
        if (!file || !file.sha)
            throw new Error(`Failed to fetch file`);
        await octokit.rest.repos.deleteFile({
            owner: config.github.owner,
            repo: config.github.repo,
            path: Gamemode[gamemode] + "/" + filename,
            message: `Automated Deletion ${filename}`,
            sha: file.sha,
            branch: config.github.branch
        });
        console.log(`File deleted ${filename}`);
        return;
    }
    catch (e) {
        throw e;
    }
}
/**
 * Upload a discord attachment to github
 */
export async function addFileAttached(file, gamemode, filename) {
    try {
        if (file === undefined)
            throw new Error(`NULL file attached`); //how?
        if (!/^[A-Za-z]+\.msav/.test(filename))
            throw new Error(`Invalid file name. Files must end in .msav and use only letters`); // for convinence, I hate special chars
        let data = await getFileContents(file.url);
        addFileBuffered(data, gamemode, filename);
    }
    catch (e) {
        throw e;
    }
}
/**
 * Uploads buffered data to github
 */
export async function addFileBuffered(data, gamemode, filename) {
    try {
        let sha = null;
        try {
            sha = (await getFile(gamemode, filename)).sha;
            console.info(`Updating file ${filename}`);
        }
        catch (error) {
            console.info(`Creating new file ${filename}`);
            sha = null;
        }
        await octokit.repos.createOrUpdateFileContents({
            owner: config.github.owner,
            repo: config.github.repo,
            path: Gamemode[gamemode] + "/" + filename,
            message: `Automatic Upload ${filename}`,
            branch: config.github.branch,
            content: data.toString('base64'),
            sha: (sha) ? (sha) : (undefined)
        });
        console.log(`Uploaded ${filename} to server`);
    }
    catch (e) {
        throw e;
    }
}
/**
 * Addmap but required to override a exsisting file
 */
export async function updateFileAttached(file, gamemode, filename) {
    try {
        if (!/^[^/\\]*\.msav$/.test(filename))
            throw new Error(`Map files cannot include \"\\\" or \"/\" and must end in \".msav\"`);
        if (file === undefined)
            throw new Error(`Attached file is undefined.`);
        if (!await getFile(gamemode, filename))
            throw new Error(`Unknown map ${filename}, if this is a new map, please upload it with /add_map`);
        await addFileAttached(file, gamemode, filename);
    }
    catch (e) {
        throw e;
    }
}
/***
 * Alter a github file's name
 */
export async function renameFile(gamemode, oldName, newName) {
    try {
        if (!/^[A-Za-z]+\.msav/.test(newName))
            throw new Error(`Invalid new file name. Files must end in .msav and use only letters`);
        let res = await getFile(gamemode, oldName);
        if (!res || !res.download_url)
            throw new Error(`Cannot download file ${oldName}`);
        let contents = await getFileContents(res.download_url);
        await addFileBuffered(contents, gamemode, newName);
        await deleteFile(gamemode, oldName);
    }
    catch (e) {
        throw e;
    }
}
