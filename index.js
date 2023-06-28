const fs = require('fs');

class S89 {
    constructor() {
        this.id = 900;
        this.fields = require('./S-89.json');

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
        for (const [name, info] of Object.entries(this.fields)) {
            data[`${this.id}_${info.id}_${info.type}`] = this[name];
        }
        return data;
    }

    savePDF() {
        const self = this;
        require('pdf-fill-form').writeBuffer(fs.readFileSync('S-89_T.pdf'), this.getData(), { "save": "pdf" } ).then(async function(result) {
            fs.writeFile(`${self.date} ${self.name}.pdf`, result, function(err) {
                if(err) {
                    return console.log(err);
                }
            });
        }, function(err) {
            console.log(err);
        });
    }
}

const data = require('../07-jul.json');
for (const meeting of data.meetings) {
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
                if(value.label) {
                    doc.other = true;
                    doc.other_text = value.label;
                } else {
                    doc[label] = true;
                }
                doc.savePDF();
            }
        }
    }
}
