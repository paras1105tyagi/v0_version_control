#!/usr/bin/env node


import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto'; 
import { timeStamp } from 'console';
import {diffLines} from 'diff';
import chalk from 'chalk';
import { Command } from 'commander';

const program = new Command();

class Groot{
    constructor(repoPath ='.'){
        this.repoPath = path.join(repoPath,'.groot');
        this.ObjectsPath = path.join(this.repoPath,'objects');
        this.headPath = path.join(this.repoPath,'HEAD');
        this.indexPath = path.join(this.repoPath,'index');
        this.init();
    }

    async init(){
        await fs.mkdir(this.ObjectsPath, {recursive: true});
        try { 
           await fs.writeFile(this.headPath,'',{flag: 'wx'});
        //    wx means open for writing, fails if file exists already

        await fs.writeFile(this.indexPath, JSON.stringify([]),{flag: 'wx'});
        process.stdout.write(chalk.green("Initialised Empty v0_version_repo"));
        } catch(error){
            console.log("Already initialsied the .groot folder");
        }
    }
    
    // hash method is needed as it is also used in git for files which are to be added and we will be using crypto module of js as it provide cryptographic elements and we will ve using SHA1 hash and it create 40 decimal hexadecimal string
    hashObject(content){
     return crypto.createHash('sha1').update(content,'utf-8').digest('hex');  
    }


    async add(fileToBeAdded){
        // fileToBeAdded : path/to/file
        const fileData = await fs.readFile(fileToBeAdded,{encoding: 'utf-8'});
        const fileHash = this.hashObject(fileData);
        console.log(fileHash);
        // here 40 characters are used to make a file, what I can do is use initial 2 characters for making directory and remaining 38 characters can be used for making file
        const newfileHashedObjectsPath = path.join(this.ObjectsPath,fileHash);
        await fs.writeFile(newfileHashedObjectsPath,fileData);
        await this.updateStagingArea(fileToBeAdded,fileHash);
       
        process.stdout.write(chalk.green("Added " + fileToBeAdded));
    }

    async updateStagingArea(filePath, fileHash){
        const index = JSON.parse(await fs.readFile(this.indexPath, {encoding: 'utf-8'}));

        index.push({path:filePath,hash:fileHash});
        await fs.writeFile(this.indexPath, JSON.stringify(index));
    }

    async commit(message){
        const index= JSON.parse(await fs.readFile(this.indexPath,{encoding: 'utf-8'}));
        const parentCommit = await this.getCurrentHead();

        const commitData = {
            timeStamp: new Date().toString(),
            message: message,
            files: index,
            parent: parentCommit
        };

        const commitHash = this.hashObject(JSON.stringify(commitData));
        const commitPath = path.join(this.ObjectsPath,commitHash);
        await fs.writeFile(commitPath,JSON.stringify(commitData));
        await fs.writeFile(this.headPath, commitHash);
        // now clear the staging area
        await fs.writeFile(this.indexPath, JSON.stringify([]));
        // console.log(`Commit successfully created ${commitHash}`);
        process.stdout.write(chalk.yellow("Commit successfully created " + commitHash));
    }



    async getCurrentHead(){
        try{
            return await fs.readFile(this.headPath, {encoding: 'utf-8'});
        } catch(error){
            return null;
        }
    }


    async log(){
        let currentCommitHash = await this.getCurrentHead();
        while(currentCommitHash){
            const commitData = JSON.parse(await fs.readFile(path.join(this.ObjectsPath,currentCommitHash), {encoding: 'utf-8'}));
            console.log('...........................................;')
            // console.log(`Commit:${currentCommitHash}\n Date: ${commitData.timeStamp}\n\n${commitData.message}\n\n`);
            process.stdout.write(chalk.blueBright("Commit: " + currentCommitHash +"\n"+"Date: " + commitData.timeStamp + "\n\n" +commitData.message +"\n\n" ));
            currentCommitHash = commitData.parent;
        }
    }


    async showCommitDiff(commitHash){
        const commitData = JSON.parse(await this.getCommitData(commitHash));
        if(!commitData){
            console.log("Commit not found");
            return ;
        }
        console.log("changes in the last commit are: ");
        for (const file of commitData.files){
            console.log(`Files: ${file.path}`);
            const fileContent = await this.getFileContent(file.hash);
            console.log(fileContent);
            
            if(commitData.parent){
                // get parent data first
                const parentCommitData = JSON.parse(await this.getCommitData(commitData.parent));
                const getParentFileContent = await this.getParentFileContent(parentCommitData,file.path);

                if(getParentFileContent!=undefined){
                    console.log('\n Diff:');
                    const diff = diffLines(getParentFileContent, fileContent);
                    

                    // console.log(diff);
                    process.stdout.write(chalk.greenBright(diff));
                    diff.forEach(part =>{
                        if(part.added){
                           process.stdout.write(chalk.green("++"+part.value));
                        }else if(part.removed){
                            process.stdout.write(chalk.red("--"+part.value));
                        }else{
                            process.stdout.write(chalk.grey(part.value));
                        }
                    });
                    console.log();
                }else{
                    // console.log("New file in this commit");
                    process.stdout.write(chalk.green("New file in this commit"));
                }
            }else{
                // console.log("First commit");
                process.stdout.write(chalk.bgYellowBright("First commit"));
            }

        }
    }
    async getParentFileContent(parentCommitData, filePath){
        const parentFile = parentCommitData.files.find(file =>file.path == filePath);
        if(parentFile){
            // get the file content from parent commit and return the commit
            return await this.getFileContent(parentFile.hash);
        }
    }
    async getCommitData(commitHash){
        const commitPath = path.join(this.ObjectsPath,commitHash);
        try{
         return await fs.readFile(commitPath,{encoding: 'utf-8'});
        } catch(error){
          console.log("Failed to read the commit data",error);
          return null;
        }
    }

    async getFileContent(fileHash){
        const objectPath = path.join(this.ObjectsPath,fileHash);
        return fs.readFile(objectPath,{encoding: 'utf-8'});
    }
}


// here I have used async function because if I dont use async then It may directly call groot.add befor groot.init can complete which may result in an error as I have faced on ENON and unexpected JSON

// (async () => {
//     const groot = new Groot();
//     await groot.init(); // Explicitly wait for initialization
    // await groot.add('sample.txt');
    // await groot.add('sample2.txt');
    //  await groot.commit('Initial commit');
    //  await groot.commit('Second commit');
    
    // await groot.commit('finally commit');
    //  await groot.log();
//          await groot.showCommitDiff('eaa52462ebebc65976485a4c1ec313fb25ee53cf');
//   })();



//   to enable chalk node groot.mjs



program.command('init').action(async ()=>{
    const groot = new Groot();
});

program.command('add <file>').action(async(file)=>{
    const groot = new Groot();
    await groot.add(file);
});

program.command('commit <message>').action(async(message)=>{
    const groot = new Groot();
    await groot.commit(message);
});

program.command('log').action(async () =>{
    const groot = new Groot();
     await groot.log();
})

program.command('show <commitHash>').action(async(commitHash)=>{
    const groot = new Groot();
    await groot.showCommitDiff(commitHash);
});


program.parse(process.argv);



// now have to add branch file