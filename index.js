const pdfFillForm = require('pdf-fill-form');
var fs = require('fs');

class S89 {
  constructor() {
    this.id = 900;
    this.fields = {
      name: {
        id: 1,
        type: 'Text'
      },
      assistant: {
        id: 2,
        type: 'Text'
      },
      date: {
        id: 3,
        type: 'Text'
      },
      bible_reading: {
        id: 4,
        type: 'CheckBox'
      },
      initial_call: {
        id: 5,
        type: 'CheckBox'
      },
      initial_call_text: {
        id: 5,
        type: 'Text'
      },
      return_visit: {
        id: 7,
        type: 'CheckBox'
      },
      return_visit_text: {
        id: 8,
        type: 'Text'
      },
      bible_study: {
        id: 9,
        type: 'CheckBox'
      },
      talk: {
        id: 10,
        type: 'CheckBox'
      },
      other: {
        id: 11,
        type: 'CheckBox'
      },
      other_text: {
        id: 12,
        type: 'Text'
      },
      main_hall: {
        id: 13,
        type: 'CheckBox'
      },
      auxiliary_classroom_1: {
        id: 14,
        type: 'CheckBox'
      },
      auxiliary_classroom_2: {
        id: 15,
        type: 'CheckBox'
      }
    };

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

  setProperty(property, value) {
    if (property in this) {
      this[property] = value;
    }
  }

  getData() {
    const data = {};
    for (const [name, info] of Object.entries(this.fields)) {
      data[`${this.id}_${info.id}_${info.type}`] = this[name];
    }
      console.log(data);
    return data;
  }

    savePDF(name) {
        pdfFillForm.writeBuffer(fs.readFileSync('S-89_T.pdf'), this.getData(), { "save": "pdf" } ).then(function(result) {
            fs.writeFile(name + '.pdf', result, function(err) {
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
        doc.setProperty('main_hall', true);
        doc.setProperty('date', meeting.date);
        if (label === 'bible_reading') {
            doc.setProperty('name', value.reader);
            doc.setProperty('bible_reading', true);
        }
        if (label === 'initial_call' && value.student) {
            doc.setProperty('name', value.student);
            doc.setProperty('assistant', value.assistant);
            if(value.label) {
                doc.setProperty('other', true);
                doc.setProperty('other_text', value.label);
            } else {
                doc.setProperty('initial_call', true);
            }
        }
        if (label === 'return_visit' && value.student) {
            doc.setProperty('name', value.student);
            doc.setProperty('assistant', value.assistant);
            if(value.label) {
                doc.setProperty('other', true);
                doc.setProperty('other_text', value.label);
            } else {
                doc.setProperty('return_visit', true);
            }
        }
        if (label === 'bible_study' && value.student) {
            doc.setProperty('name', value.student);
            doc.setProperty('assistant', value.assistant);
            if(value.label) {
                doc.setProperty('other', true);
                doc.setProperty('other_text', value.label);
            } else {
                doc.setProperty('bible_study', true);
            }
            console.log(value);
        }
        doc.savePDF(doc.name);
    }
  }
}
