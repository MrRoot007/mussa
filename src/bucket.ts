import path from 'path';
import fs from 'fs';

const mainfile = require?.main?.filename || '';
const platform = process.platform === 'win32' ? 'win' : 'unix';
const mussa_path = path.dirname(mainfile).replace('dist', ''); 
const bucket = {
    sdfcli: path.join(mussa_path, 'sdfcli', platform),
    suitescripts: path.join(mussa_path, 'suitescripts.json'),
    records: path.join(mussa_path, 'records.json'),
    template: path.join(mussa_path, 'template'),
    customscript: path.join(mussa_path, 'customscript'),
    scriptdeployment: path.join(mussa_path, 'scriptdeployment'),
    questions: {
        on_create_script: [
            {
                type: 'input',
                name: 'name',
                prefix: '👾',
                message: 'Nombre del script:',
                validate: (value: string) => {
                    if (!value.match(/([a-z]{1,24})$/)) return 'Caracteres no permitidos o ha excedido el tamaño.';
                    if (!value.match(/^((?!\.[a-z]).)*$/s)) return 'No ingreses una extensión';
                    return true;
                },
            },
            {
                type: 'input',
                name: 'description',
                prefix: '👾',
                message: 'Agrega una descripción al script:',
                validate: (value: string) => {
                    if (value.length < 2) return 'La descripción debe tener al menos 50 caracteres';
                    return true;
                },
            },
            {
                type: 'confirm',
                name: 'scriptrecord',
                message: 'Agregar script record',
            }
        ],
        on_select_script_type: [
            {
                type: 'list',
                name: 'type',
                prefix: '👾',
                message: 'Selecciona el tipo de script:',
                choices: Object.entries(JSON.parse(fs.readFileSync(path.join(path.dirname(mainfile).replace('dist', ''), 'suitescripts.json'), 'utf-8'))).map((el, index) => el[0]),
            }
        ],
        on_create_project: [
            {
                type: 'input',
                name: 'email',
                prefix: '👾',
                message: 'Escribe tu correo de acceso a Netsuite: ',
                validate: (value: string) => {
                    if (!value) return 'El correo es obligatorio...';
                    return true;
                }
            },
            {
                type: 'input',
                name: 'author',
                prefix: '👾',
                message: 'Escribe tu nombre:',
                validate: (value: string) => {
                    if (!value) return 'El nombre es obligatorio...';
                    return true;
                }
            },
            {
                type: 'input',
                name: 'abbr',
                prefix: '👾',
                message: 'Escribe el prefijo que identificará al cuenta: ',
                validate: (value: string) => {
                    if (value.length != 3) return 'Tamaño no válido, solo tres caracteres son permitidos';
                    return true;
                }
            },
            {
                type: 'confirm',
                name: 'remote',
                prefix: '👾',
                message: 'Agregar remoto',
            }
        ]
    }
}

export default bucket;