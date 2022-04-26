// Globals

var version = "1.1 (early-alpha)";

// Class Defs

var LinesMorph;
var ReaderMorph;
var IDE_Morph;
var EditorMorph;
var PaneMorph;

//////////////////////////////////////////////////////////////////////////
// LinesMorph ////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////

//LinesMorph.prototype

//////////////////////////////////////////////////////////////////////////
// PaneMorph /////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////

PaneMorph.prototype = Object.create(FrameMorph.prototype);
PaneMorph.prototype.constructor = PaneMorph;
PaneMorph.uber = FrameMorph.prototype;

function PaneMorph () {
    this.init();
}

PaneMorph.prototype.init = function () {
    PaneMorph.uber.init.call(this);
    this.setColor(BLACK);
}

PaneMorph.prototype.reactToDropOf = function (morph) {
    if (morph instanceof WindowMorph || morph instanceof DialogBoxMorph) {
        this.world.add(morph);
    }
}

PaneMorph.prototype.wantsDropOf = function (morph) {
    if (morph instanceof DialogBoxMorph) {
        return false;
    }
    return true;
}

//////////////////////////////////////////////////////////////////////////
// IDE_Morph /////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////

/*
    I am a container/controller for two panes:

        the Editor
        and the Reader

    These two panes are shown to the user whenever.
*/

IDE_Morph.prototype = Object.create(FrameMorph.prototype);
IDE_Morph.prototype.constructor = IDE_Morph;
IDE_Morph.uber = FrameMorph.prototype;

function IDE_Morph () {
    this.init();
}

IDE_Morph.prototype.init = function () {
    IDE_Morph.uber.init.call(this);

    // props
    this.cloud = new Cloud();
    this.color = BLACK;
    this.lastShown = "menu";

    // panes
    this.reader = null;
    this.editor = null;
    this.menu = null;
    this.back = null;
	this.disableDevMode = !param_exists("devMode");

    if (isNil(sessionStorage.getItem("user-id"))) {
        sessionStorage.setItem("user-id", generateUUID());
    }

    this.buildPanes();
    this.fixLayout();

    touchScreenSettings.globalFontFamily = 
        standardSettings.globalFontFamily = 
            MorphicPreferences.globalFontFamily = "Poppins";
};

IDE_Morph.prototype.showUserID = function () {
	var dlg = new DialogBoxMorph();

    var aligner = new AlignmentMorph("column");

    txt = new TextMorph(
        'Your User ID (for sharing) is:\n\n',
        dlg.fontSize,
        dlg.fontStyle,
        true,
        false,
        'center',
        null,
        null,
        MorphicPreferences.isFlat ? null : new Point(1, 1),
        WHITE
    );

    aligner.add(txt);
    var field = new InputFieldMorph(
        sessionStorage.getItem("user-id")
    );
    field.setWidth(250);
    field.childThatIsA(StringMorph).enableSelecting();
    aligner.add(field);

    dlg.key = 'userid(`' + generateUUID() + '`)';
    dlg.labelString = 'User ID';
    dlg.createLabel();
    dlg.addBody(aligner);
    dlg.addButton('ok', "OK");
    dlg.fixLayout();
	dlg.userMenu = nomenu;
    dlg.popUp(this.world);
}

IDE_Morph.prototype.buildPanes = function () {
    this.createMainPanes();
    this.createMainMenu();
};

IDE_Morph.prototype.createMainPanes = function () {
    this.reader = new ReaderMorph(this);
    this.editor = new EditorMorph(this);
    this.add(this.reader);
    this.add(this.editor);
};

IDE_Morph.prototype.showEditor = function () {
    this.showMenu("editor");
};

IDE_Morph.prototype.showReader = function () {
    this.showMenu("reader");
}

IDE_Morph.prototype.createMainMenu = function () {
    var menu, cont, title, oedit, oreader, oabout, ouser, backToMenu, overd;

    menu = new PaneMorph();
    
    menu.oldChanged = menu.changed;
	menu.versionDis = null;
    menu.changed = function () {
        menu.oldChanged();
		this.childThatIsA(AlignmentMorph).setCenter(this.center);
		if (this.versionDis instanceof StringMorph) {
			this.versionDis.setTop(this.top + this.height - this.versionDis.height);
			this.versionDis.setLeft(this.left + this.width - this.versionDis.width);
		}
    }
    
    cont = new AlignmentMorph("column");
    menu.add(cont);
    
    title = new TextMorph("StoryMaker!", 24);
	title.fontStyle = "Poppins";
    title.setColor(WHITE);
    title.isBold = title.isItalic = true;
    title.fixLayout();
    title.fixLayout();
    title.fixLayout();
    title.changed();

	menu.title = title;

    cont.add(title);
    cont.addSpace(56);

    function fixButton (btn) {
        btn.unpressedColor = BLACK;
        btn.highlightColor = BLACK.lighter(10);
        btn.pressedColor = BLACK.lighter(20);
        btn.labelColor = WHITE;
        btn.setWidth(140);
        btn.setHeight(20);
		btn.fontStyle = "Poppins";
        btn.createLabel();
        btn.color = btn.unpressedColor;
        return btn;
    }

    oedit = fixButton(new TriggerMorph(this, "showEditor", "editor"));
    oreader = fixButton(new TriggerMorph(this, "showReader", "reader"));
    oabout = fixButton(new TriggerMorph(this, "about", "about this app..."));
    ouser = fixButton(new TriggerMorph(this, "showUserID", "my user id..."));

	
    cont.add(oedit);
    cont.addSpace(12);
    cont.add(oreader);
	cont.addSpace(12);
	cont.add(oabout);
	cont.addSpace(12);
	cont.add(ouser);

	overd = new StringMorph("ver " + version, 14, "Poppins");
	overd.setColor(WHITE.darker(25));
	overd.mouseDoubleClick = function () {
		console.log("DEVMODE");
		this.parentThatIsA(IDE_Morph).disableDevMode = false;
		this.world.isDevMode = true;
	}
	overd.fps = 40;
	overd.step = function () {
		this.ignoresEvents = false;
	}

	menu.versionDis = overd;
	menu.add(overd);

    this.menu = menu;
    this.add(this.menu);

    backToMenu = new TriggerMorph(this, "showMainMenu", "Back to Main Menu", 12, null, null, null, WHITE);
    fixButton(backToMenu);
    backToMenu.setWidth(140);

    this.back = backToMenu;

    this.add(this.back);

};

IDE_Morph.prototype.informNoOk = function (title, text) {
    var dlg = new DialogBoxMorph(), txt;
    txt = new TextMorph(
        text,
        dlg.fontSize,
        dlg.fontStyle,
        true,
        false,
        'center',
        null,
        null,
        MorphicPreferences.isFlat ? null : new Point(1, 1),
        WHITE
    );

    dlg.key = generateUUID();
    dlg.labelString = title;
    dlg.createLabel();
    dlg.addBody(txt);
    dlg.fixLayout();
	dlg.userMenu = nomenu;
    dlg.popUp(this.world);
    return dlg
}

IDE_Morph.prototype.showMenu = function (menu, onfinish) {
    this.add(this[menu]);

    var things = this.children.filter((child) => {
        return child.isVisible == true;
    })

    this[menu].setPosition(new Point(0, this.height));
    this[menu].show();
    this.add(this.back);
    this[menu].glideTo(new Point(0, -5), 500, "quadratic", () => {
        this[menu].setPosition(new Point(0, -5));
        this[menu].glideTo(new Point(0, 2), 100, "quadratic", () => {
            this[menu].setPosition(new Point(0, 2));
            this[menu].glideTo(new Point(0, 0), 500, "quadratic", () => {
                things.forEach((morph) => {
                    morph.hide();
                });
                this.back.show();
                this[menu].setPosition(ZERO);
                this[menu].show();
                if (onfinish) {
                    onfinish();
                }
            });
        })
    });
};

IDE_Morph.prototype.userMenu = nomenu;

IDE_Morph.prototype.showMainMenu = function () {
    if (!this.menu.isVisible) {
        this.showMenu("menu");
    }
};

IDE_Morph.prototype.reactToDropOf = function (morph) {
    if (morph instanceof WindowMorph || morph instanceof DialogBoxMorph) {
        this.world.add(morph);
    }
}

IDE_Morph.prototype.wantsDropOf = function (morph) {
    if (morph instanceof DialogBoxMorph) {
        return false;
    }
    return true;
}

IDE_Morph.prototype.about = function () {
    var d = new DialogBoxMorph();
    d.key = Time.now.toString();
	d.userMenu = nomenu;
    d.inform(
        "About",
        "This is a project created with morphic.js\n\n" +
		"By the way, this stupid thing has no security what so ever cuz literally\neverything is handled on the client.",
        this.world
    );
};

IDE_Morph.prototype.reactToWorldResize = function () {
    this.setExtent(arguments[0].extent);
};

IDE_Morph.prototype.openIn = function (world) {
    world.add(this);
    this.setExtent(world.extent);

    if (param_exists("reader")) {
        if (param_exists("name") && param_exists("author")) {
            this.reader.readStory(get_param("name"), get_param("author"));
        }
    } else if (param_exists("editor")) {
        if (param_exists("name") && param_exists("author")) {
            if (sessionStorage.getItem("user-id") == get_param("author")) {
				this.editor.loadStory(get_param("name"), get_param("author"));
			}
        }
    }

	if (param_exists("devMode")) {
		this.world.isDevMode = true;
	}

	setTimeout(() => {
		var morphs = this.allChildren.filter((child) => {
			return child instanceof StringMorph || child instanceof TextMorph;
		}).forEach((child) => {
			child.fixLayout();
			child.changed();
		});
		this.fixLayout();
        this.menu.changed();
	}, 1000);
};

IDE_Morph.prototype.fixLayout = function () {
    if (!this.reader) return;

    this.reader.setExtent(this.extent);
    this.editor.setExtent(this.extent);
    this.menu.setExtent(this.extent);

    this.back.setPosition(new Point(0, this.height - this.back.height));
}

IDE_Morph.prototype.fail = function (err) {
    var d = new DialogBoxMorph();
    d.key = Time.now.toString();
	d.userMenu = nomenu;
    d.inform("Cloud Error!", err.toString().substring(err.toString().indexOf(" "), err.toString().length), this.world);
};

IDE_Morph.prototype.getStory = function (reader, name, author) {
    this.cloud.getStory(name, author, (req) => {
        try {
			if (reader instanceof ReaderMorph) {
            	var dat = JSON.parse(atob(req.responseText));
	            reader.pages = dat.pages;
	            reader.page = dat.pages[0];
				reader.storyData = dat;
	            reader.update();
	            this.showMenu("reader");
	        } else {
	            var dat = JSON.parse(atob(req.responseText));
	            reader.pages = dat.pages;
	            reader.storyData = dat;
	            reader.meta = dat.meta;
	            reader.updateData();
	            reader.fixLayout();
	            reader.createPageEditor();
	            this.showMenu("editor", () => {
	                reader.fixLayout();
	            });
	        }
		} catch (e) {};
    }, this.fail);
};

IDE_Morph.prototype.postStory = function (json) {
    this.cloud.postStory(json.meta.name, sessionStorage.getItem("user-id"), btoa(JSON.stringify(json)), (req) => {
        var dlg = new DialogBoxMorph();

        var aligner = new AlignmentMorph("column");

        txt = new TextMorph(
            'Your story "' + json.meta.name + '" has been uploaded to the\n' +
            'StoryMaker Cloud.\nYou can use this URL to see your story:\n\n',
            dlg.fontSize,
            dlg.fontStyle,
            true,
            false,
            'center',
            null,
            null,
            MorphicPreferences.isFlat ? null : new Point(1, 1),
            WHITE
        );

        aligner.add(txt);
        var field = new InputFieldMorph(
            window.location.origin + 
            "/?reader&name=" + 
            encodeURIComponent(json.meta.name) + 
            "&author=" + 
            sessionStorage.getItem("user-id")
        );
        field.setWidth(200);
        field.childThatIsA(StringMorph).enableSelecting();
        aligner.add(field);

        dlg.key = 'upload(`' + generateUUID() + '`)';
        dlg.labelString = 'Story Uploaded';
        dlg.createLabel();
        dlg.addBody(aligner);
        dlg.addButton('ok', "OK");
        dlg.fixLayout();
		dlg.userMenu = nomenu;
        dlg.popUp(this.world);
    }, this.fail);
};

IDE_Morph.prototype.step = function () {
	if (this.disableDevMode) {
		eval("world.isDevMode = false");
	}
}

IDE_Morph.prototype.deleteStory = function (name, author) {
    var dlg = this.informNoOk("Deleting Story", "Deleting In Progress...");
    this.cloud.deleteStory(name, author, (req) => {
        if (req.responseText.toLowerCase().includes("error")) {
            this.fail(req.responseText);
        } else {
            var d = this.informNoOk("Story Deleted", "Your story named \"" + name + "\" has been deleted.", this.world);
            setTimeout(() => {
                d.destroy();
            }, 2000);
        }
        dlg.destroy();
    }, (e) => {
        dlg.destroy();
        this.fail(e);
    });
};

//////////////////////////////////////////////////////////////////////////
// EditorMorph ///////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////

/*
    I am just an editor for stories and such.

    I am used by the IDE_Morph
*/

EditorMorph.prototype = Object.create(PaneMorph.prototype);
EditorMorph.prototype.constructor = EditorMorph;
EditorMorph.uber = PaneMorph.prototype;

function EditorMorph (ide) {
    this.init(ide);
};

EditorMorph.prototype.init = function (ide) {
    EditorMorph.uber.init.call(this);

    // props:
    this.ide = ide;
    this.buttonHeight = 40;
    this.fps = 4;
    this.cloud = this.ide.cloud;
	this.storedName = null;
    this.pages = [
		"[empty]"
	];
    this.currentPage = 0;
    this.meta = {
        name: "Untitled Story",
        author: "Anonymous",
        dateOfCreation: Time.DATE,
		allowedEditors: [
			sessionStorage.getItem("user-id")
		]
    };
    this.storyData = {
        birthTime: Time.now,
        pages: this.pages,
        meta: null
    };
    this.measureCtx = document.createElement("canvas").getContext("2d");
    this.measureCtx.font = "18px sans-serif";

    // panes:
    this.topBar = null;
    this.editor = null;
    this.navig = null;
    this.next = null;
    this.prev = null;
	this.pageDisplay = null;
    this.fadeBar = null;

    this.buildPanes();
};

EditorMorph.prototype.loadStory = function (name, author, showInstant) {
    this.ide.cloud.getStory(name, author, (req) => {
        try {
			this.step = nop;

	        var dat = JSON.parse(atob(req.responseText));
	
	        console.log(JSON.parse(atob(req.responseText)))
	
	        if (dat.meta.allowedEditors.indexOf(sessionStorage.getItem("user-id") != -1)) {
				this.pages = dat.pages;
		        this.meta = dat.meta;
		        this.storyData = JSON.parse(JSON.stringify(dat));
		        this.storyData = JSON.parse(JSON.stringify(dat));
		        this.storyData = JSON.parse(JSON.stringify(dat));
		
		        this.editor.childThatIsA(TextMorph).text = this.storyData.pages[this.currentPage];
		
		        this.updateData();
		        this.createPageEditor();
		        this.fixLayout();
		        if (showInstant) {
                    this.ide.editor.setPosition(ZERO);
                    this.ide.editor.show();
                    this.ide.add(this.ide.editor);
                    this.ide.add(this.ide.back);
                } else {
                    this.ide.showMenu("editor");
                }
		
				this.updatePageDisplay();
		        this.step = function () {
		            this.updateData();
		        }
			} else {
				this.ide.fail("Error: User not allowed to edit this story");
				this.ide.editor = new EditorMorph(this.ide);
				this.destroy();
				this.ide.fixLayout();
				if (showInstant) {
                    this.ide.editor.setPosition(ZERO);
                    this.ide.editor.show();
                    this.ide.add(this.ide.editor);
                    this.ide.add(this.ide.back);
                } else {
                    this.ide.showMenu("editor");
                }
			}
		} catch (e) {
			this.ide.editor = new EditorMorph(this.ide);
			this.destroy();
			this.ide.fixLayout();
			if (showInstant) {
                this.ide.editor.setPosition(ZERO);
                this.ide.editor.show();
                this.ide.add(this.ide.editor);
                this.ide.add(this.ide.back);
            } else {
                this.ide.showMenu("editor");
            }
		}
    }, this.ide.fail);
};

EditorMorph.prototype.step = function () {
    this.updateData();
};

EditorMorph.prototype.updateData = function () {
    this.storyData.meta = this.meta;
    this.storyData.pages = this.pages;

    this.pages[this.currentPage] = this.editor.childThatIsA(TextMorph).text;
    this.storyData.pages = this.pages;
};

EditorMorph.prototype.fixLayout = function () {
    if (!this.topBar) return;

    this.topBar.setWidth(this.width);
    this.topBar.align.setPosition(this.topBar.position.add(10));
    this.topBar.setHeight(this.buttonHeight + 20);

    /*this.topBar.about.setPosition(new Point(
        (this.topBar.left + this.topBar.width) - this.topBar.about.width - 10, 
        this.topBar.top + 10
    ));*/
    
    this.editor.setPosition(this.topBar.bottomLeft.add(new Point(10, 10)));
    this.editor.setWidth(this.width - 40);
    this.editor.setHeight(this.height - this.buttonHeight - this.buttonHeight - 80);

    this.navig.setPosition(this.editor.bottomLeft.add(new Point(0, 10)));
    this.navig.setWidth(this.width - 40);
    this.navig.setHeight(this.buttonHeight);

    this.next.setPosition(new Point((this.navig.left + this.navig.width) - this.next.width, this.navig.top));
	this.pageDisplay.setCenter(this.navig.center);
};

EditorMorph.prototype.updatePageDisplay = function () {
	this.pageDisplay.text = "Page " + (this.currentPage + 1) + " out of " + this.pages.length + " pages";
	this.pageDisplay.fixLayout();
	this.pageDisplay.changed();
	this.pageDisplay.setCenter(this.navig.center);
	this.pageDisplay.rerender();
    this.navig.changed();
};

EditorMorph.prototype.buildPanes = function () {
    this.createTopBar();
    this.createPageEditor();
    this.createButtons();
};

EditorMorph.prototype.nextPage = function () {
    this.currentPage++;
    if (this.pages.length <= this.currentPage) {
        if (isNil(this.pages[this.currentPage])) {
            this.pages[this.currentPage] = "[INSERT TEXT HERE]";
        }
    }
    this.createPageEditor();
    this.fixLayout();
	this.updatePageDisplay();
};

EditorMorph.prototype.prevPage = function () {
    this.currentPage--;
    if (this.currentPage < 0) {
        this.currentPage = this.pages.length - 1;
    }
    this.createPageEditor();
    this.fixLayout();
	this.updatePageDisplay();
};

EditorMorph.prototype.shareStoryWith = function () {
	this.meta.allowedEditors.push(arguments[0]);
	this.updateData();
};

EditorMorph.prototype.promptShareStoryWith = function () {
	var dlg = new DialogBoxMorph(this, "shareStoryWith");
	dlg.key = Time.now.toString();
	dlg.userMenu = nomenu;
	dlg.prompt(
		"Share Story With User (with id of)",
		generateUUID(),
		this.world
	);
};

EditorMorph.prototype.about = function () {
    this.ide.about();
};

EditorMorph.prototype.newStory = function () {
    this.pages = [
		"[empty]"
	];
    this.currentPage = 0;
    this.meta = {
        name: "Untitled Story",
        author: "Anonymous",
        dateOfCreation: Time.DATE,
		allowedEditors: [
			sessionStorage.getItem("user-id")
		]
    };
    this.storyData = {
        birthTime: Time.now,
        pages: this.pages,
        meta: null
    };
    this.editor.childThatIsA(TextMorph).text = this.pages[0];
    this.editor.childThatIsA(TextMorph).fixLayout();
    this.editor.changed();
    this.editor.adjustScrollBars();
    this.editor.contents.adjustBounds();
    this.editor.adjustScrollBars();
    this.editor.adjustToolBar();
    this.updatePageDisplay();
};

EditorMorph.prototype.showStoryManipulationMenu = function () {
    var menu = new MenuMorph(this);
    menu.addItem("New Story", "newStory");
    menu.addLine();
    menu.addItem("Upload Story", "uploadStory");
    menu.addItem("Delete Story", "deleteStory");
    menu.addItem("Open Story", "openStory");
    menu.addItem("Share Story", "promptShareStoryWith");
    menu.addLine();
    menu.addItem("Export Story", "exportStory");
    menu.addItem("Load Story", "loadExportedStory");
    menu.addItem("Export Story Meta", "exportStoryMeta");
    menu.addItem("Load Story Meta", "loadStoryMeta");
    menu.addLine();
    menu.addItem("About...", "about");
    menu.popup(this.world, this.topBar.file.bottomLeft);
};

EditorMorph.prototype.showStorySettingsMenu = function () {
    var menu = new MenuMorph(this);
    menu.addItem("Story Meta", "showStoryConfig");
    menu.popup(this.world, this.topBar.config.bottomLeft);
};

EditorMorph.prototype.exportStoryMeta = function () {
    this.updateData();
    var dat = btoa(JSON.stringify(this.storyData.meta));
    saveAs(new Blob([ dat ], { type: "text/plain" }), this.storyData.meta.name + ".strm");
};

EditorMorph.prototype.loadStoryMeta = function () {
    var input = document.createElement("input");
    input.type = "file";
    input.accept = ".strm";
    input.onchange = () => {
        if (input.files.length == 1) {
            var reader = new FileReader();
            reader.onload = (e) => {
                var data = JSON.parse(atob(e.target.result));
                this.step = nop;
                this.meta = data;
                this.updateData();
                this.fixLayout();
                this.step = function () {
                    this.updateData();
                };
                input.remove();
            }
            reader.readAsText(input.files[0]);
        } else {
            input.remove();
        }
    };
    input.click();
};

EditorMorph.prototype.loadExportedStory = function () {
    var input = document.createElement("input");
    input.type = "file";
    input.accept = ".stry";
    input.onchange = () => {
        if (input.files.length == 1) {
            var reader = new FileReader();
            reader.onload = (e) => {
                var data = JSON.parse(atob(e.target.result));
                this.step = nop;
                this.currentPage = 0;
                this.storyData = data;
                this.meta = data.meta;
                this.pages = data.pages;
                this.editor.childThatIsA(TextMorph).text = data.pages[this.currentPage];
                this.updatePageDisplay();
                this.fixLayout();
                this.step = function () {
                    this.updateData();
                };
                input.remove();
            }
            reader.readAsText(input.files[0]);
        } else {
            input.remove();
        }
    };
    input.click();
};

EditorMorph.prototype.syncChanges = function () {
    this.loadStory(this.storyData.meta.name, this.storyData.meta.author, true);
    this.updatePageDisplay();
};

EditorMorph.prototype.createTopBar = function () {
    var align, bar, file, config, sync;
    var self = this;

    bar = new FrameMorph();
    bar.setColor(BLACK.lighter(20));
    bar.fixLayout = function () {
        this.align.fixLayout();
        this.align.changed();
    }

    function fixButton (btn) {
        var file =btn;
        file.color = BLACK.lighter(20);
        file.highlightColor = file.color.darker(5);
        file.pressColor = file.color.darker(10);
        return file;
    }

    align = new AlignmentMorph("row");
    
    file = fixButton(new ButtonMorph(this, "showStoryManipulationMenu", new SymbolMorph("file", 24)));
    config = fixButton(new ButtonMorph(this, "showStorySettingsMenu", new SymbolMorph("gears", 24)));
    sync = fixButton(new ButtonMorph(this, "syncChanges", new SymbolMorph("arrowUp", 24)));

    align.add(new StringMorph("Editor | ", 24, "Poppins", null, null, null, null, null, WHITE));
    align.addSpace();
    align.add(file);
    align.addSpace();
    align.add(config);
    align.addSpace();
    align.add(sync);
    align.fixLayout();

    bar.align = align;

    bar.file = file;
    bar.config = config;
    bar.add(bar.align);

    this.topBar = bar;
    this.add(this.topBar);
};

EditorMorph.prototype.createPageEditor = function () {
    var cont, txt;

    if (this.editor) {
        this.editor.destroy();
    }

    cont = new ScrollFrameMorph();
    cont.setColor(CLEAR);
    cont.reactToDropOf = IDE_Morph.prototype.reactToDropOf;
    cont.wantsDropOf = IDE_Morph.prototype.wantsDropOf;
    cont.contents.reactToDropOf = IDE_Morph.prototype.reactToDropOf;
    cont.contents.wantsDropOf = IDE_Morph.prototype.wantsDropOf;
    cont.contents.setColor(CLEAR);
    cont.step = function () {
        this.txt.setPosition(this.contents.position);
        this.txt.fixLayout();
    }
    cont.isTextLineWrapping = true;

    txt = new TextMorph(this.storyData.pages[this.currentPage], 18);
	txt.fontStyle = "Poppins";
    txt.setPosition(cont.contents.position);
    txt.reactToInput = function () {
        this.parentThatIsA(ScrollFrameMorph).adjustScrollBars();
        this.parentThatIsA(ScrollFrameMorph).adjustToolBar();
    }
    txt.setColor(WHITE);
    txt.isEditable = true;
	txt.fixLayout();
    // for some odd reason, holding down the left mouse button and moving it does not select
    txt.enableSelecting();
    // adjust
    cont.adjustScrollBars();
    cont.adjustToolBar();

    cont.addContents(txt);
    cont.txt = txt;

    this.editor = cont;
    this.add(this.editor);
    
    this.editor.changed();
};

EditorMorph.prototype.openStoryWithAuthorOf = function (val) {
	try {
    	this.loadStory(this.storedName, val);
        this.updatePageDisplay();
		this.storedName = null;
	} catch (e) {};
}

EditorMorph.prototype.openPromptedStory = function (val) {
	this.storedName = val;
	var dlg = new DialogBoxMorph(this, "openStoryWithAuthorOf");
	dlg.key = "open-story-s-" + Time.now.toString();
	dlg.userMenu = nomenu;
	dlg.prompt("Enter the author of the story", sessionStorage.getItem("user-id"), this.world);
}

EditorMorph.prototype.openStory = function () {
    var dlg = new DialogBoxMorph(this, "openPromptedStory");
	dlg.key = "open-story-" + Time.now.toString();
	dlg.userMenu = nomenu;
	dlg.prompt("Enter the name of the story", "Untitled Story", this.world);
}

EditorMorph.prototype.createButtons = function () {
    var navig, next, prev, pageDis;
    var self = this;

    navig = new PaneMorph();

    function fixButtons (...btns) {
        btns.forEach((btn) => {
            btn.labelColor = WHITE;
            btn.color = BLACK;
            btn.unpressedColor = BLACK;
            btn.highlightColor = BLACK.lighter(5);
            btn.pressedColor = BLACK.lighter(10);
            btn.setWidth(120);
            btn.setHeight(self.buttonHeight);
			btn.fontStyle = "Poppins";
            btn.createLabel();
        })
    }

    next = new TriggerMorph(this, "nextPage", "Next", 24);
    prev = new TriggerMorph(this, "prevPage", "Previous", 24);

    fixButtons(next, prev);

	pageDis = new StringMorph("Page " + (this.currentPage + 1) + " out of " + this.pages.length + " pages", 18, "Poppins");
	pageDis.setColor(WHITE);
	pageDis.setCenter(navig.center);

    navig.add(prev);
    navig.add(next);
	navig.add(pageDis);

	this.pageDisplay = pageDis;
    this.next = next;
    this.prev = prev;
    this.navig = navig;
    this.add(this.navig);
}

EditorMorph.prototype.deleteStory = function () {
    this.ide.deleteStory(this.storyData.meta.name, sessionStorage.getItem("user-id"));

	// big "F U" moment
    this.ide.showMenu("menu");
	this.ide.editor = new EditorMorph(this.ide);
	this.destroy();
	this.ide.fixLayout();
	this.ide.showMenu("editor");
};

EditorMorph.prototype.uploadStory = function () {
    this.updateData();
    this.ide.postStory(this.storyData);
};

EditorMorph.prototype.exportStory = function () {
    this.updateData();
    var data = btoa(JSON.stringify(this.storyData));
    saveAs(new Blob([ data ], { type: "text/plain" }), this.storyData.meta.name + ".stry");
};

EditorMorph.prototype.saveStoryConfig = function (some, popup) {
	var wind = popup;
    wind.editor.meta.author = wind.mem.author.getValue();
    wind.editor.meta.name = wind.mem.name.getValue();
    wind.editor.meta.dateOfCreation = wind.mem.doc.getValue();
    wind.editor.updateData();
	//popup.destroy();
};

EditorMorph.prototype.showStoryConfig = function () {
    var popup, align, title, name, author, doc, ok;

    var spacer = new StringMorph(" ", 24);

	var self = this;

    popup = new DialogBoxMorph(this, "saveStoryConfig");
	popup.editor = this;
	popup.key = "story-config-" + Time.now.toString();
	popup.labelString = "Story Metadata of \"" + this.storyData.meta.name + "\"";
	popup.createLabel();
    align = new AlignmentMorph("column");

    popup.mem = {};

    title = new TextMorph("Story Data:", 24, "Poppins");
    title.isItalic = true;

    align.add(title);
    align.add(spacer.fullCopy());
    
    var align2 = new AlignmentMorph("row");

    align2.add(new StringMorph("Name:", 18, "Poppins"));
    align2.addSpace(12);
    
    name = new InputFieldMorph(this.meta.name.toString());

    align2.add(name);
    align.add(align2);

    popup.mem.name = name;

    align.addSpace(12);
    
    var align3 = new AlignmentMorph("row");

    align3.add(new StringMorph("Author:", 18, "Poppins"));
    align3.addSpace(12);

    author = new InputFieldMorph(this.meta.author.toString());

    align3.add(author);
    align.add(align3);

    popup.mem.author = author;

    align.addSpace(12);

    var align4 = new AlignmentMorph("row");

    align4.add(new StringMorph("Date of Creation:", 18, "Poppins"));
    align4.addSpace(12);

    doc = new InputFieldMorph(this.meta.dateOfCreation);

    align4.add(doc);
    align.add(align4);

    popup.mem.doc = doc;
    var self = this;

	popup.userMenu = nomenu;


    popup.addBody(align);
	popup.addButton('ok', "Save Metadata");
	popup.addButton('cancel', "Cancel");
	popup.align = align;
	popup.oldFix = popup.fixLayout;
	popup.fixLayout = function () {
		this.align.fixLayout();
		this.oldFix();
	};
	popup.fixLayout();
	popup.popUp(this.world);
};

//////////////////////////////////////////////////////////////////////////
// ReaderMorph ///////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////

/*
    I am a STORY VIEWER for the IDE_Morph.

    I can be used by the IDE to show, fetch, or get stories then
    show them to the user.
*/

ReaderMorph.prototype = Object.create(PaneMorph.prototype);
ReaderMorph.prototype.constructor = ReaderMorph;
ReaderMorph.uber = PaneMorph.prototype;

function ReaderMorph(ide) {
    this.init(ide);
};

ReaderMorph.prototype.init = function (ide) {
    ReaderMorph.uber.init.call(this);

    // props
    this.ide = ide;
    this.cloud = this.ide.cloud;
    this.pages = [""];
    this.currentPage = 0;
    this.page = "";
	this.buttonHeight = 50;
	this.storyData = {};

    // panes
    this.story = null;
    this.storyCont = null;
    this.prevb = null;
    this.nextb = null;
    this.btnCont = null;
	this.pageDis = null;
	this.topBar = null;
	this.title = null;

    this.buildPanes();
};

ReaderMorph.prototype.update = function () {
	this.page = this.pages[this.currentPage];
    this.story.text = this.page;
    this.story.fixLayout();
    this.story.changed();
    this.storyCont.changed();
	this.pageDis.text = "Page " + (this.currentPage + 1) + " out of " + this.pages.length + " pages";
	this.pageDis.fixLayout();
	this.pageDis.setCenter(this.btnCont.center);
	this.pageDis.changed();
	this.title.text = this.storyData.meta.name;
	this.title.fixLayout();
	this.title.setCenter(this.topBar.center);
	this.title.changed();
};

ReaderMorph.prototype.readStory = function (name, author) {
    this.ide.getStory(this, name, author);
};

ReaderMorph.prototype.nextPage = function () {
    this.currentPage++;
    if (this.currentPage >= this.pages.length) {
        this.currentPage = 0;
    }
    this.page = this.pages[this.currentPage];
    this.update();
};

ReaderMorph.prototype.prevPage = function () {
    this.currentPage--;
    if (this.currentPage < 0) {
        this.currentPage = this.pages.length - 1;
    }
    this.page = this.pages[this.currentPage];
    this.update();
};

ReaderMorph.prototype.fixLayout = function () {
    if (!this.nextb) return;

    var buttonsHeight = this.buttonHeight;

	// top bar

	this.topBar.setWidth(this.width - 20);
	this.topBar.setHeight(buttonsHeight);
	this.topBar.setPosition(this.position.add(10));
	this.title.setCenter(this.topBar.center)
    
    // story
    this.storyCont.bounds = this.bounds.insetBy(10);
	this.storyCont.setPosition(this.topBar.bottomLeft.add(new Point(0, 10)));
    this.storyCont.setHeight(this.height - 20 - buttonsHeight - buttonsHeight - 30);
    this.story.setPosition(this.storyCont.position);
    this.storyCont.fps = 50;
    this.storyCont.step = function () {
        this.hBar.destroy();
    }

    // button container
    
    this.btnCont.setLeft(this.storyCont.left);
    this.btnCont.setTop(this.height - 40 - buttonsHeight);
    this.btnCont.setHeight(buttonsHeight);
    this.btnCont.setWidth(this.width - 20);

	// page display

	this.pageDis.fixLayout();
	this.pageDis.setCenter(this.btnCont.center);
	this.pageDis.changed();

    // buttons

    this.prevb.setPosition(this.btnCont.position);
    this.prevb.setHeight(buttonsHeight);
    this.prevb.setWidth(120);

    this.nextb.setWidth(100);
    this.nextb.setPosition(new Point(
        this.btnCont.left + this.btnCont.width - this.nextb.width,
        this.btnCont.top
    ));
    this.nextb.setHeight(buttonsHeight);
};

ReaderMorph.prototype.buildPanes = function () {
	this.createTopBar();
    this.createStoryPane();
	this.createNavigation();
};

ReaderMorph.prototype.createTopBar = function () {
	var bar, title;

	bar = new PaneMorph();

	title = new StringMorph("Title Goes Here", this.buttonHeight, "Poppins");
	title.setColor(WHITE);
	
	this.title = title;
	bar.add(this.title);

	this.topBar = bar;
	this.add(this.topBar);
}

ReaderMorph.prototype.createStoryPane = function () {
    var cont, story;

    cont = new ScrollFrameMorph();
    cont.setColor(CLEAR);
    cont.contents.setColor(CLEAR);

    this.storyCont = cont;
    
    story = new TextMorph("[STORY GOES HERE]", 18, "Poppins");
    story.color = WHITE;
	story.enableLinks = true;

    this.story = story;
    this.storyCont.addContents(this.story);

    this.add(this.storyCont);
};

ReaderMorph.prototype.createNavigation = function () {
	var next, prev, display, btnCont;

	btnCont = new PaneMorph();

    this.btnCont = btnCont;

    function fixButtons (...btns) {
        btns.forEach((btn) => {
            btn.labelColor = WHITE;
            btn.color = BLACK;
            btn.unpressedColor = BLACK;
            btn.highlightColor = BLACK.lighter(5);
            btn.pressedColor = BLACK.lighter(10);
            btn.createLabel();
        })
    }

	next = new TriggerMorph(this, "nextPage", "Next", 24);
    prev = new TriggerMorph(this, "prevPage", "Previous", 24);
	next.fontStyle = prev.fontStyle = "Poppins";
	next.createLabel();
	prev.createLabel();
    next.fixLayout();
    prev.fixLayout();

    fixButtons(next, prev);

    this.nextb = next;
    this.prevb = prev;
    this.btnCont.add(this.nextb);
    this.btnCont.add(this.prevb);

	display = new StringMorph("Page " + (this.currentPage + 1) + " out of " + this.pages.length + " pages", 18, "Poppins");
	display.setColor(WHITE);
	
	this.pageDis = display;
	
	this.btnCont.add(this.pageDis);

    this.add(this.btnCont);
}
