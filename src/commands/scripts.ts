import inquirer from 'inquirer';
import child_process from 'child_process';
import path from 'path';
import fs from 'fs';
import bucket from '../bucket';

const scripts = {
    create: (): void => { }
}

scripts.create = () => {
    inquirer.prompt(bucket.questions.on_select_script_type).then(answer => {
        const suitescript = JSON.parse(fs.readFileSync(bucket.suitescripts, 'utf-8'));
        const config = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'config.json'), 'utf-8'));
        const script = {
            record: answer.type,
            id: '',
            app_type: config.type,
            type: suitescript[answer.type].name,
            abbreviation: suitescript[answer.type].abbreviation,
            version: suitescript[answer.type].latest_version,
            entry_points: [],
            author: config.author,
            author_email: config.email,
            root: config.name,
            name: '',
            description: '',
            script_record: '',
        }
        inquirer.prompt([
            {
                type: 'checkbox',
                name: 'entrypoint',
                prefix: '👾',
                message: "Selecciona los puntos de entrada:",
                choices: suitescript[answer.type].entry_points.map((el: any) => { return { name: el } }),
                validate: (value) => {
                    if (!value.length) return 'Debes seleccionar al menos un punto de entrada!';
                    return true;
                }
            }
        ]).then(answer => {
            script.entry_points = answer.entrypoint.concat([' ']);
            inquirer.prompt(bucket.questions.on_create_script).then(answer => {
                script.name = `${config.prefix}_${script.abbreviation}_${answer.name.replace(/\s/g, '_')}.js`;
                script.description = answer.description;
                script.script_record = `${config.prefix}|${script.abbreviation}|${answer.name.replace(/\.js/, '')}`.toUpperCase();
                script.id = answer.name.replace(/([a-z]{3}_|\.js)/g, '').substr(0, 28);

                let template_script = fs.readFileSync(bucket.template, 'utf-8'); //se carga el template de scripts
                template_script = template_script.replace('{author}', script.author)
                    .replace('{author_email}', script.author_email)
                    .replace('{script_name}', script.name)
                    .replace('{date_created}', new Date().toLocaleString())
                    .replace('{description}', script.description)
                    .replace('{script_type}', script.type)
                    .replace('{api_version}', script.version)
                    .replace('{entry_point}', script.entry_points.join(': null,\n    \t'))
                    .replace('{entry_point_functions}', script.entry_points.map((el) => (el == '' || el == null || el == ' ') ? '' : (`\tentry_point.${el} = function (context) {\n\t\t// Write your awesome code!...  \n\t}//end ${el} \n\n`)).join(''));

                //se crea el archivo JS en el directorio root del proyecto
                fs.writeFile(path.join(process.cwd(), config.path, script.name), template_script, 'utf-8', () => { });
                //si el usuario selecciona agregar un script record
                if (answer.scriptrecord) {
                    switch (script.record) {
                        case 'restlet':
                        case 'suitelet': {
                            let customscript = fs.readFileSync(path.join(bucket.customscript, `${script.record}.xml`), 'utf-8');
                            let scriptdeployment = fs.readFileSync(path.join(bucket.scriptdeployment, 'scriptdeployment.xml'), 'utf-8');
                            scriptdeployment = scriptdeployment
                                .replace('{deploy}', `${script.id}_1`)
                                .replace('{recordtype}', '')
                                .replace('{env}', config.released ? 'RELEASED' : 'TESTING')
                                .replace('{title}', '<title>sup yo</title>');
                            customscript = customscript
                                .replace('{name}', script.script_record)
                                .replace('{scriptid}', script.id)
                                .replace('{description}', script.description)
                                .replace('{path}', `${config.path.replace(/\\/g, '/').replace('FileCabinet', '')}/${script.name}`);

                            //se completa el custonscript con su script record ya llenado
                            customscript = customscript.replace('{scriptdeployment}', scriptdeployment);
                            //se crea la carpeta suctonscript si aun no existe
                            if (!fs.existsSync(path.join(process.cwd(), 'Objects', 'customscript'))) fs.mkdirSync(path.join(process.cwd(), 'Objects', 'customscript'));
                            //se escribe el archivo customscript xml
                            fs.writeFile(path.join(process.cwd(), 'Objects', 'customscript', `customscript_${script.id}.xml`), customscript, 'utf8', (err) => { });
                            break;
                        }
                        case 'mapreduce':
                        case 'scheduled': {
                            break;
                        }
                        case 'client':
                        case 'userevent': {
                            //se listan todos los records donde se pueden aplicar despliegues
                            inquirer.prompt([
                                {
                                    type: 'checkbox',
                                    name: 'record',
                                    prefix: '👾',
                                    message: "Selecciona el tipo de record donde se desplegará el script: ",
                                    choices: JSON.parse(fs.readFileSync(bucket.records, 'utf-8')).concat([new inquirer.Separator()]),
                                    validate: (value) => {
                                        if (!value.length) return 'El valor es obligatorio!...';
                                        return true;
                                    }
                                }
                            ]).then(answer => {
                                let customscript = fs.readFileSync(path.join(bucket.customscript, `${script.record}.xml`), 'utf-8');
                                let scriptdeployment = fs.readFileSync(path.join(bucket.scriptdeployment, 'scriptdeployment.xml'), 'utf-8');
                            });
                            break;
                        }
                        default: {
                            break;
                        }
                    }
                }
            });
        });
    });
}
export default scripts;