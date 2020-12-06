import inquirer from 'inquirer';
import path from 'path';
import fs from 'fs';
import bucket from '../bucket';
import { script_record } from '../interfaces/script_record';

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
                script.script_record = `${config.prefix}|${script.abbreviation}|${answer.name.replace(/\_/g, ' ').replace(/\.js/, '')}`.toUpperCase();
                script.id = `${script.abbreviation}_${answer.name.replace(/([a-z]{3}_|\.js)/g, '').substr(0, 28)}`;

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
                            create_script_deployment({
                                id: script.id,
                                name: script.script_record,
                                script_type: script.record,
                                is_released: config.released,
                                description: script.description,
                                path: `${config.path.replace(/\\/g, '/').replace('FileCabinet', '')}/${script.name}`,
                                deployment: fs.readFileSync(path.join(bucket.scriptdeployment, 'event_deployment.xml'), 'utf-8'),
                                apply_to: [''],
                            });
                            break;
                        }
                        case 'mapreduce':
                        case 'scheduled': {
                            create_script_deployment({
                                id: script.id,
                                name: script.script_record,
                                script_type: script.record,
                                is_released: config.released,
                                description: script.description,
                                path: `${config.path.replace(/\\/g, '/').replace('FileCabinet', '')}/${script.name}`,
                                deployment: fs.readFileSync(path.join(bucket.scriptdeployment, 'scheduled_deployment.xml'), 'utf-8'),
                                apply_to: [''],
                            });
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
                                        if (!value.length) return 'Selecciona al menos un record!...';
                                        return true;
                                    }
                                }
                            ]).then(answer => {
                                create_script_deployment({
                                    id: script.id,
                                    name: script.script_record,
                                    script_type: script.record,
                                    is_released: config.released,
                                    description: script.description,
                                    path: `${config.path.replace(/\\/g, '/').replace('FileCabinet', '')}/${script.name}`,
                                    deployment: fs.readFileSync(path.join(bucket.scriptdeployment, 'event_deployment.xml'), 'utf-8'),
                                    apply_to: answer.record,
                                });
                            });
                            break;
                        }
                        default: {
                            break;
                        }
                    }
                    process.exit(0);
                }
            });
        });
    });
};
export default scripts;
/**
 * 
 * @param {script_record} script
 * @returns {void}
 * @description Cargar el archivo de definición custom_script deacuerdo al tipo de script para crear el customscript record junto con el scriptdeployment 
 */
function create_script_deployment(script: script_record): void {
    let custom_script = fs.readFileSync(path.join(bucket.customscript, `${script.script_type}.xml`), 'utf-8');
    let script_deployment = script.deployment;

    script_deployment = script.apply_to.map((el: any, index: any) => {
        let record_type = '';
        if (el !== '') record_type = (el !== 'CUSTOMRECORD') ? `<recordtype>${el}</recordtype>` : '<recordtype>[scriptid=]</recordtype>';
        let result = script_deployment
            .replace('{deploy}', `${script.id}_${+1}`)
            .replace('{recordtype}', record_type)
            .replace('{env}', script.is_released ? 'RELEASED' : 'TESTING')
            .replace('{title}', `<title>sup yo ${index + 1}</title>`);
        return result;
    }).join('\n');

    custom_script = custom_script
        .replace('{name}', `${script.name}`)
        .replace('{scriptid}', `${script.id}`)
        .replace('{description}', `${script.description}`)
        .replace('{scriptdeployment}', `${script_deployment}`)
        .replace('{path}', `${script.path.replace(/\\/g, '/')
            .replace('FileCabinet', '')}/${script.name}`);

    //se crea la carpeta suctonscript si aun no existe
    if (!fs.existsSync(path.join(process.cwd(), 'Objects', 'customscript'))) fs.mkdirSync(path.join(process.cwd(), 'Objects', 'customscript'));
    //se escribe el archivo customscript xml
    fs.writeFile(path.join(process.cwd(), 'Objects', 'customscript', `customscript_${script.id}.xml`), custom_script, 'utf8', (err) => { });
}