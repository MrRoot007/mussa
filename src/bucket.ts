import path from 'path';
const mainfile = require?.main?.filename || '';
const platform = process.platform === 'win32' ? 'win' : 'unix';

const bucket = {
    sdfcli: path.join(path.dirname(mainfile).replace('dist', ''), 'sdfcli', platform),
    questions: {
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
                    if (value.length != 3) return 'Tamaño no válido, solo tres caracteres son permitidos baboso 🙊';
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