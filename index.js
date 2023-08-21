const pdfff = require('pdf-fill-form');
const fields = require('./S-89.json');
const filesys = require('fs');

class S89 {
    constructor() {
        this.id = 900;

        this.name = '';
        this.date = '';
        this.assistant = '';
        this.bible_reading = false;
        this.initial_call = false;
        this.initial_call_text = '';
        this.return_visit = false;
        this.return_visit_text = '';
        this.bible_study = false;
        this.talk = false;
        this.other = false;
        this.other_text = '';
        this.main_hall = false;
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
                const doc = new S89();
                doc.main_hall = true;
                doc.date = meeting.date;
                if (label === 'bible_reading') {
                    doc.name = value.reader;
                    doc.bible_reading = true;
                    doc.savePDF();
                }
                if(value.student) {
                    doc.name = value.student;
                    doc.assistant = value.assistant ?? '';
                    if(value.label && !["Primeira conversa", "Revisita", "Estudo bíblico"].includes(value.label)) {
                        doc.other = true;
                        doc.other_text = value.label;
                    } else {
                        doc[label] = true;
                        switch (label) {
                            case 'initial_call':
                                doc.initial_call_text = value.advice; break;
                            case  'return_visit':
                                doc.return_visit_text = value.advice; break;
                        }
                    }
                    doc.savePDF();
                }
            }
        }
    }
});

program.parse();