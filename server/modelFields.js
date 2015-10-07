function clearStr(value) {
/*
    var d = document.createElement('div');
    d.innerHTML = value;
    var str = d.textContent || d.innerText || "";
    return str.trim();
*/
    return value;
}

var srcAttr = 'src=\"',
    wikiAddr = 'http://wiki.ringcentral.com';

var modelFields = [
    'ID' //from wiki, not used
    , {
        name: 'Foto',
        convert: function (value) {
            var fotoPath = value && value.replace(srcAttr, srcAttr + wikiAddr).
                    replace('width', '_width').
                    replace('height', '_height') || "";

            return fotoPath ? "http://contacts.int.nordigy.ru/foto/" + fotoPath : '';
        }
    }
    , {
        name: 'Name',
        convert: function (value, record) {
            value = clearStr(value);
            if (value) {
                var nameParts = value.split(" ");

                if (nameParts.length) {
                    var firstName = nameParts.shift();
                    if (firstName) {
                        record.FirstName = firstName;
                    }

                    if (nameParts.length) {
                        var lastName = nameParts.join(" ").trim();
                        record.LastName = lastName.trim();
                    }
                    else {
                    }
                }
            }

            return value;
        }
    }
    , 'FirstName' //calculated, see Name convert
    , 'LastName' //calculated, see Name convert
    , 'Title'
    , 'Dept'
    , 'Group'
    , {
        name: 'Department',
        convert: function (uselessValue, record) {
            var group = clearStr(record.Group) || "",
                dept = clearStr(record.Dept) || "";

            var r = (dept + (dept && group ? "." : "") + group) || "no dept/group";
            return r;
        }
    }
    , 'Manager'
    , 'Email'
    , 'CellPhone'
    , 'ExtRC'
    , 'ExtSPB'
    , 'Skype'
    , 'Birthday'
    , 'OtherContacts'
];

module.exports = modelFields;