var srcAttr = 'src=\"',
    wikiAddr = 'http://wiki.xxxxxx.com';

Ext.define('dinoContacts.model.contactModel', {
    extend: 'Ext.data.Model',
        config: {
            fields: [
                'id'
                ,'ID' //from wiki, not used
                , {
                    name: 'Foto',
                    convert: function(value, record){
                        return value && value.replace(srcAttr, srcAttr + wikiAddr).
                            replace('width', '_width').
                            replace('height', '_height') || "";

                    }
                }
                , {
                    name: 'Name',
                    convert: function(value, record){
                        if (value) {
                            var nameParts = value.split(" ");

                            if (nameParts.length) {
                                var firstName = nameParts.shift();
                                if (firstName) {
                                    record.set('FirstName', firstName)
                                }

                                if (nameParts.length) {
                                    var lastName = nameParts.join(" ").trim();
                                    record.set('LastName', lastName.trim())
                                }
                                else{
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
                ,{
                    name: 'GroupAndDept',
                    convert: function(uselessValue, record){
                        var d = document.createElement('div');
                        function clearStr(value) {
                            d.innerHTML = value;
                            var str =  d.textContent || d.innerText || "";
                            return str.trim();
                        }

                        var group = clearStr(record.get('Group')),
                            dept = clearStr(record.get('Dept'));

                        var r = (dept + (dept && group ? "." : "") + group) || "no dept/group";
                        return "[" + r + "]";
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
            ]
        }
    }
);
