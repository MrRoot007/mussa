import inquirer from 'inquirer';
import child_process from 'child_process';
import path from 'path';
import fs from 'fs';
import bucket from '../bucket';

const project = {
    create: (project_name: string): void => { }
}

project.create = (project_name) => {
    inquirer.prompt([
        {
            type: 'list',
            name: 'type',
            prefix: '👾',
            message: 'Selecciona el tipo de proyecto:',
            choices: ['ACCOUNTCUSTOMIZATION', 'SUITEAPP'],
        }
    ]).then(answer => {
        switch (answer.type) {
            case 'ACCOUNTCUSTOMIZATION': {
                //se ejecuta el comando SDF para la creación del proyecto
                child_process.spawn(
                    path.join(bucket.sdfcli, `sdfcli createproject -type ${answer.type} -parentdirectory ${process.cwd()} -projectname ${project_name}`),
                    { stdio: 'inherit', shell: true }
                ).on('close', code => {
                    if (code) return;//salida con error del comando SDF createproject
                    process.chdir(path.join(process.cwd(), project_name));//se ingresa al directorio del proyecto recien creado
                    //se ejecuta el comando SDF adddependencies
                    const add_dependencies = child_process.exec(path.join(bucket.sdfcli, `sdfcli adddependencies -authid mussa -p ${process.cwd()} -feature SERVERSIDESCRIPTING:required CUSTOMRECORDS:required CRM:required`),);
                    add_dependencies?.stdin?.write('YES\n');
                    add_dependencies.on('close', code => {
                        if (code) return;//salida con error del comando SDF adddependencies
                        //se inicializa repositorio git y se crea el archivo .gitignore
                        child_process.spawn(
                            'git init',
                            { stdio: 'inherit', shell: true }
                        ).on('close', code => {
                            if (code) return; //salida con error del comando git init
                            //se crea el archivo .gitignore
                            fs.writeFile(path.join('.', '.gitignore'), 'error.log\nnode_modules/\npackage-lock.json\n.vscode/\nconfig.json', () => { });
                            //preguntas para inicializar el config.json de mussa y para agregar el traking al remoto
                            inquirer.prompt(bucket.questions.on_create_project).then(answer => {
                                const config = {
                                    name: project_name,
                                    author: answer.author,
                                    email: answer.email,
                                    type: 'ACCOUNTCUSTOMIZATION',
                                    path: `${path.join('FileCabinet', 'SuiteScripts', project_name)}`,
                                    authid: '',
                                    role: 55,
                                    url: 'system.netsuite.com',
                                    version: '1.0.0',
                                    released: false,
                                    prefix: answer.abbr
                                }
                                fs.writeFile(path.join('.', 'config.json'), JSON.stringify(config, null, 4), 'utf8', (err) => { });
                                //se crea el directorio principal donde se guardarán los scripts
                                fs.mkdirSync(config.path);
                                //se eliminan directorios que no usan
                                fs.rmdir(path.join('FileCabinet', 'Templates', 'E-mail Templates'), () => { });
                                fs.rmdir(path.join('FileCabinet', 'Templates', 'Marketing Templates'), () => { });
                                fs.rmdir(path.join('FileCabinet', 'Web Site Hosting Files'), () => { });
                                fs.rmdir(path.join('FileCabinet', 'Templates'), () => { });
                                fs.rmdir('Translations', () => { });
                                //si se selecciona agregar el tracking a un remoto entonces se pregunta por la url para ejecutar el comando de git
                                if (answer.remote) {
                                    inquirer.prompt({
                                        type: 'input',
                                        name: 'url',
                                        message: 'Cuál es la URL del remoto a seguir: ',
                                        validate: (value) => {
                                            if (!value) return 'La url no puede ser una cadena vacia';
                                            return true;
                                        }
                                    }).then(answer => child_process.spawn(`git remote add origin ${answer.url}`, { stdio: 'inherit', shell: true }));
                                }
                            });
                        });
                    });
                });
                break;
            }
            case 'SUITEAPP': {
                //TODO crear suiteapp
                console.log('Aún no es posible crear suiteapps, pero estamos trabajando 👷‍♂️🛠');
                break;
            }
        }
        process.exit(0);//salida del script con éxito
    });
};


export default project;