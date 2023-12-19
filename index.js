const pdfff = require('pdf-fill-form');
const fields = require('./S-89.json');
const filesys = require('fs');

class S89 {
    constructor(date) {
        this.id = 900;

        this.name = '';
        this.assistant = '';
        this.date = date;
        this.part_number = '';
        this.main_hall = true;
        this.auxiliary_classroom_1 = false;
        this.auxiliary_classroom_2 = false;
    }

    getData() {
        const data = {};
        for (const [name, info] of Object.entries(fields)) {
            data[`${this.id}_${info.id}_${info.type}`] = this[name];
        }
        return data;
    }

    savePDF() {
        const self = this;
        pdfff.writeBuffer(filesys.readFileSync('S-89_T.pdf'), this.getData(), { "save": "pdf" } ).then(async function(result) {
            const assistant = self.assistant.length > 0 ? ` & ${self.assistant}` : '';
            filesys.writeFile(`output/${self.date} ${self.name}${assistant}.pdf`, result, function(err) {
                if(err) {
                    return console.log(err);
                }
            });
        }, function(err) {
            console.log(err);
        });
    }
}

const { program } = require('commander');

program.argument('<file>', 'life and ministry meeting json schedule file name').action((file) => {
    for (const meeting of require(`./${file}`).meetings) {
        if (!meeting.message) {
            for (const [label, value] of Object.entries(meeting)) {
                if (label === 'bible_reading') {
                    const doc = new S89(meeting.date);
                    doc.name = value.reader;
                    doc.part_number = 3;
                    doc.savePDF();
                }
                if (label == 'apply_yourself_to_the_field_ministry') {
                    value.forEach((assignment) => {
                        if(!assignment.assigned) { return; }
                        const doc = new S89(meeting.date);
                        doc.name = assignment.assigned;
                        doc.assistant = assignment.assistant ?? '';
                        doc.part_number = assignment.number;
                        doc.savePDF();
                    });
                }
            }
        }
    }
});

program.parse();