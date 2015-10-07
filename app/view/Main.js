Ext.define('dinoContacts.view.Main', {
    extend: 'Ext.Container',
    alias: 'widget.mainView',
    requires: [
        'Ext.TitleBar'
        ,'Ext.dataview.List'
        ,'Ext.Menu'
    ],
    config: {
        scrollable: true,
        itemId: 'mainView',

        items: [
            {
                docked: 'top',
                xtype: 'titlebar',
                title: 'Loading data...',
                itemId: 'titlebar',
                items: [
                    {
                        xtype: 'button',
                        iconCls: 'settings',
                        itemId: 'showSettingsMenu',
                        align: 'left',
                        handler: function () {
                            Ext.Viewport.toggleMenu('left');
                        }
                    }
                ]
            },
            {
                xtype: 'textfield',
                itemId: 'nameFilter',
                style: 'margin: 5px',
                placeHolder: 'Enter name, department or title'
            },
            {
                id:'contactsList',
                itemId:'contactsList',
                xtype:'list',
                height: 400,
                disableSelection: true,
                pinHeaders: false,

                onItemDisclosure : true,

                //todo move styles to separate css
                itemTpl: new Ext.XTemplate('<div class="contact" style="width:100%"> <span class="name">{Name}</span> <span class="title">{Title}</span> <table class="detailed_info" style="display: none"> <tr> <td class="foto"></td> <td valign="top" class="info"> <!--todo replace with media query--> <!--(window.innerWidth > 480 ?--> <p>{CellPhone} <br/> <a class="email" href="mailto:{Email}">{Email}</a><br/> <span style="color:#666">skype: </span> <a style="color:#666" href="skype:{Skype}">{Skype}</a><br/></p></td></tr></table></div></div></div>'),
                store: 'contactStore',
                grouped: true
            }
        ]
    }});

function createMenu(){
    var menu = Ext.create('Ext.Menu', {
        id : 'menuSettings',
        items : [
            {
                itemId: 'menuUpdate',
                xtype: 'button',
                text: 'Обновить',
                iconCls: 'refresh',

                //todo style in other way
                style: 'margin-top:10px'
            }
        ]
    });

    Ext.Viewport.setMenu(menu, {
        side: 'left'
        ,reveal: true
    });
}
