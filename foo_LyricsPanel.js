'use strict';

// modified from text reader sample

window.DefineScript('lyrics', {author:'author'});
include(fb.ComponentPath + 'samples\\complete\\js\\lodash.min.js');
include(fb.ComponentPath + 'samples\\complete\\js\\helpers.js');

let panel = new _panel();
let text = new _text('lyrics', LM, TM, 0, 0);

panel.item_focus_change();

function on_size() {
	panel.size();
	text.w = panel.w - (LM * 2);
	text.h = panel.h - TM;
	text.size();
}

function on_paint(gr) {
	panel.paint(gr);
	gr.GdiDrawText(panel.tf("%title%"), panel.fonts.title, panel.colours.highlight, LM, 0, panel.w - (LM * 2), TM, LEFT);
	gr.DrawLine(text.x, text.y + 1, text.x + text.w, text.y + 1, 1, panel.colours.highlight);
	text.paint(gr);
}

function on_metadb_changed() {
	text.metadb_changed();
}

function on_mouse_wheel(s) {
	text.wheel(s);
}

function on_mouse_move(x, y) {
	text.move(x, y);
}

function on_mouse_lbtn_up(x, y) {
	text.lbtn_up(x, y);
}

function on_mouse_rbtn_up(x, y) {
	return panel.rbtn_up(x, y, text);
}

function on_key_down(k) {
	text.key_down(k);
}

function on_colours_changed() {
	panel.colours_changed();
	window.Repaint();
}

function on_font_changed() {
	panel.font_changed();
	window.Repaint();
}

function on_item_focus_change() {
	panel.item_focus_change();
}

function on_playback_dynamic_info_track() {
	panel.item_focus_change();
}

function on_playback_new_track() {
	panel.item_focus_change();
}

function on_playback_stop(reason) {
	if (reason != 2) {
		panel.item_focus_change();
	}
}

function on_playlist_switch() {
	panel.item_focus_change();
}

// Modified from include(fb.ComponentPath + 'samples\\complete\\js\\text.js');

function _text(mode, x, y, w, h) {
	this.size = () => {
		this.rows = Math.floor((this.h - _scale(24)) / panel.row_height);
		this.up_btn.x = this.x + Math.round((this.w - _scale(12)) / 2);
		this.down_btn.x = this.up_btn.x;
		this.up_btn.y = this.y;
		this.down_btn.y = this.y + this.h - _scale(12);
		this.update();
	}
	
	this.paint = (gr) => {
		console.log(this.lines)
		for (let i = 0; i < Math.min(this.rows, this.lines.length); i++) {
			if (this.properties.fixed.enabled) {
				gr.GdiDrawText(this.lines[i + this.offset], panel.fonts.fixed, panel.colours.text, this.x, this.y + _scale(12) + (i * panel.row_height) + Math.floor(panel.row_height / 2), this.w, panel.row_height, LEFT);
			} else {
				gr.GdiDrawText(this.lines[i + this.offset], panel.fonts.normal, panel.colours.text, this.x, this.y + _scale(12) + (i * panel.row_height), this.w, panel.row_height, LEFT);
			}
		}
		this.up_btn.paint(gr, panel.colours.text);
		this.down_btn.paint(gr, panel.colours.text);
	}
	
	this.metadb_changed = () => {
		if (panel.metadb) {
				const temp_filename = panel.tf("$directory_path(%path%)/%filename%.txt");
				if (this.filename == temp_filename) {
					return;
				}
				this.filename = temp_filename;
				this.content = _open(this.filename);
				this.content = this.content.replace(/\t/g, '    ');
		} else {
			this.artist = '';
			this.filename = '';
			this.content = '';
		}
		this.update();
		window.Repaint();
	}
	
	this.trace = (x, y) => {
		return x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.h;
	}
	
	this.wheel = (s) => {
		if (this.trace(this.mx, this.my)) {
			if (this.lines.length > this.rows) {
				let offset = this.offset - (s * 3);
				if (offset < 0) {
					offset = 0;
				}
				if (offset + this.rows > this.lines.length) {
					offset = this.lines.length - this.rows;
				}
				if (this.offset != offset) {
					this.offset = offset;
					window.RepaintRect(this.x, this.y, this.w, this.h);
				}
			}
			return true;
		} else {
			return false;
		}
	}
	
	this.move = (x, y) => {
		this.mx = x;
		this.my = y;
		window.SetCursor(IDC_ARROW);
		if (this.trace(x, y)) {
			this.up_btn.move(x, y);
			this.down_btn.move(x, y);
			return true;
		} else {
			return false;
		}
	}
	
	this.lbtn_up = (x, y) => {
		if (this.trace(x, y)) {
			this.up_btn.lbtn_up(x, y);
			this.down_btn.lbtn_up(x, y);
			return true;
		} else {
			return false;
		}
	}
	
	this.rbtn_up = (x, y) => {
		panel.m.AppendMenuItem(MF_STRING, 1200, 'Refresh');
		panel.m.AppendMenuSeparator();
		panel.m.AppendMenuItem(MF_STRING , 1337, '+');
		panel.m.AppendMenuItem(MF_STRING , 1338, ' ');
		panel.m.AppendMenuItem(MF_STRING , 1339, '-');
		panel.m.AppendMenuSeparator();
		panel.m.AppendMenuItem(MF_STRING , 1994, 'Fix lyrics');
		panel.m.AppendMenuItem(MF_STRING , 1999, 'Open containing folder');
		panel.m.AppendMenuSeparator();
	}
	
	this.rbtn_up_done = (idx) => {
		switch (idx) {
		case 1337:
			this.setRating(5);
			break;
		case 1338:
			this.setRating("");
			break;
		case 1339:
			this.setRating(1);
			break;
		case 1200:
			this.filename = '';
			panel.item_focus_change();
			break;
		case 1994:
			if (_isFile(panel.tf("$directory_path(%path%)\\%filename%.txt"))) {
				_run(panel.tf("$directory_path(%path%)\\%filename%.txt"));
			} else {
				_run(panel.tf("$directory_path(%path%)"));
			}
			_run(`https://www.google.com/search?q=${ panel.tf("%artist%") }+${ panel.tf("%title%") }+lyrics`)
			break;
		case 1999:
			if (_isFile(panel.tf("$directory_path(%path%)\\%filename%.txt"))) {
				_explorer(panel.tf("$directory_path(%path%)\\%filename%.txt"));
			} else {
				_run(panel.tf("$directory_path(%path%)"));
			}
			break;
		}
	}

	this.setRating = (value) => {
		let obj = {MetaRating: value};
		let handles = new FbMetadbHandleList(panel.metadb);
		handles.UpdateFileInfoFromJSON(JSON.stringify(obj));
	}
	
	this.key_down = (k) => {
		switch (k) {
		case VK_UP:
			this.wheel(1);
			return true;
		case VK_DOWN:
			this.wheel(-1);
			return true;
		default:
			return false;
		}
	}
	
	this.update = () => {
		this.offset = 0;
		switch (true) {
		case this.w < 100 || !this.content.length:
			this.lines = [];
			break;
		case this.properties.fixed.enabled:
			this.lines = this.content.split('\n');
			break;
		default:
			this.lines = _lineWrap(this.content, panel.fonts.normal, this.w);
			break;
		}
	}
	
	this.init = () => {
		this.properties.fixed = new _p('2K3.TEXT.FONTS.FIXED', false);
	}
	
	panel.text_objects.push(this);
	this.mode = mode;
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.mx = 0;
	this.my = 0;
	this.offset = 0;
	this.content = '';
	this.artist = '';
	this.album = '';
	this.filename = '';
	this.up_btn = new _sb('\u1431', this.x, this.y, _scale(12), _scale(12), () => { return this.offset > 0; }, () => { this.wheel(1); });
	this.down_btn = new _sb("\u142F", this.x, this.y, _scale(12), _scale(12), () => { return this.offset < this.lines.length - this.rows; }, () => { this.wheel(-1); });
	this.properties = {};
	this.init();
}

/*
	Exact same as	include(fb.ComponentPath + 'samples\\complete\\js\\text.js');
	but few lines are commented out to avoid out of bounds exception when right-clicking ¯\_(ツ)_/¯
*/

function _panel(custom_background = false) {
	this.item_focus_change = () => {
		if (this.metadb_func) {
			if (this.selection.value == 0) {
				this.metadb = fb.IsPlaying ? fb.GetNowPlaying() : fb.GetFocusItem();
			} else {
				this.metadb = fb.GetFocusItem();
			}
			on_metadb_changed();
			if (!this.metadb) {
				_tt('');
			}
		}
	}
	
	this.colours_changed = () => {
		if (window.InstanceType) {
			this.colours.background = window.GetColourDUI(1);
			this.colours.text = window.GetColourDUI(0);
			this.colours.highlight = window.GetColourDUI(2);
		} else {
			this.colours.background = window.GetColourCUI(3);
			this.colours.text = window.GetColourCUI(0);
			this.colours.highlight = _blendColours(this.colours.text, this.colours.background, 0.4);
		}
		this.colours.header = this.colours.highlight & 0x45FFFFFF;
	}
	
	this.font_changed = () => {
		let name;
		let font = window.InstanceType ? window.GetFontDUI(0) : window.GetFontCUI(0);
		if (font) {
			name = font.Name;
		} else {
			name = 'Segoe UI';
			console.log(N, 'Unable to use default font. Using', name, 'instead.');
		}
		this.fonts.title = _gdiFont(name, 12, 1);
		this.fonts.normal = _gdiFont(name, this.fonts.size.value);
		this.fonts.fixed = _gdiFont('Lucida Console', this.fonts.size.value);
		this.row_height = this.fonts.normal.Height;
		_.invokeMap(this.list_objects, 'size');
		_.invokeMap(this.list_objects, 'update');
		_.invokeMap(this.text_objects, 'size');
	}
	
	this.size = () => {
		this.w = window.Width;
		this.h = window.Height;
	}
	
	this.paint = (gr) => {
		let col;
		switch (true) {
		case window.IsTransparent:
			return;
		case !this.custom_background:
		case this.colours.mode.value == 0:
			col = this.colours.background;
			break;
		case this.colours.mode.value == 1:
			col = utils.GetSysColour(15);
			break;
		case this.colours.mode.value == 2:
			col = this.colours.custom_background.value;
			break;
		}
		gr.FillSolidRect(0, 0, this.w, this.h, col);
	}
	
	this.rbtn_up = (x, y, object) => {
		this.m = window.CreatePopupMenu();
		this.s1 = window.CreatePopupMenu();
		this.s2 = window.CreatePopupMenu();
		this.s3 = window.CreatePopupMenu();
		// panel 1-999
		// object 1000+
		if (object) {
			object.rbtn_up(x, y);
		}
		if (this.list_objects.length || this.text_objects.length) {
			_.forEach(this.fonts.sizes, (item) => {
				this.s1.AppendMenuItem(MF_STRING, item, item);
			});
		/* 	this.s1.CheckMenuRadioItem(_.first(this.fonts.sizes), _.last(this.fonts.sizes), this.fonts.size.value);
			this.s1.AppendTo(this.m, MF_STRING, 'Font size');
			this.m.AppendMenuSeparator(); */
		}
		if (this.custom_background) {
			this.s2.AppendMenuItem(MF_STRING, 100, window.InstanceType ? 'Use default UI setting' : 'Use columns UI setting');
			this.s2.AppendMenuItem(MF_STRING, 101, 'Splitter');
			this.s2.AppendMenuItem(MF_STRING, 102, 'Custom');
			this.s2.CheckMenuRadioItem(100, 102, this.colours.mode.value + 100);
			this.s2.AppendMenuSeparator();
			this.s2.AppendMenuItem(this.colours.mode.value == 2 ? MF_STRING : MF_GRAYED, 103, 'Set custom colour...');
			this.s2.AppendTo(this.m, window.IsTransparent ? MF_GRAYED : MF_STRING, 'Background');
			this.m.AppendMenuSeparator();
		}
		if (this.metadb_func) {
			this.s3.AppendMenuItem(MF_STRING, 110, 'Prefer now playing');
			this.s3.AppendMenuItem(MF_STRING, 111, 'Follow selected track (playlist)');
			this.s3.CheckMenuRadioItem(110, 111, this.selection.value + 110);
			this.s3.AppendTo(this.m, MF_STRING, 'Selection mode');
			this.m.AppendMenuSeparator();
		}
		this.m.AppendMenuItem(MF_STRING, 120, 'Configure...');
		const idx = this.m.TrackPopupMenu(x, y);
		switch (true) {
		case idx == 0:
			break;
		case idx <= 20:
			this.fonts.size.value = idx;
			this.font_changed();
			window.Repaint();
			break;
		case idx == 100:
		case idx == 101:
		case idx == 102:
			this.colours.mode.value = idx - 100;
			window.Repaint();
			break;
		case idx == 103:
			this.colours.custom_background.value = utils.ColourPicker(window.ID, this.colours.custom_background.value);
			window.Repaint();
			break;
		case idx == 110:
		case idx == 111:
			this.selection.value = idx - 110;
			this.item_focus_change();
			break;
		case idx == 120:
			window.ShowConfigure();
			break;
		case idx > 999:
			if (object) {
				object.rbtn_up_done(idx);
			}
			break;
		}
		return true;
	}
	
	this.tf = (t) => {
		if (!this.metadb) {
			return '';
		}
		if (!this.tfo[t]) {
			this.tfo[t] = fb.TitleFormat(t);
		}
		const path = this.tfo['$if2(%__@%,%path%)'].EvalWithMetadb(this.metadb);
		if (fb.IsPlaying && (path.startsWith('http') || path.startsWith('mms'))) {
			return this.tfo[t].Eval();
		} else {
			return this.tfo[t].EvalWithMetadb(this.metadb);
		}
	}
	
	window.DlgCode = DLGC_WANTALLKEYS;
	this.fonts = {};
	this.colours = {};
	this.w = 0;
	this.h = 0;
	this.metadb = fb.GetFocusItem();
	this.metadb_func = typeof on_metadb_changed == 'function';
	this.fonts.sizes = [10, 12, 14, 16];
	this.fonts.size = new _p('2K3.PANEL.FONTS.SIZE', 12);
	if (this.metadb_func) {
		this.selection = new _p('2K3.PANEL.SELECTION', 0);
	}
	if (custom_background) {
		this.custom_background = true;
		this.colours.mode = new _p('2K3.PANEL.COLOURS.MODE', 0);
		this.colours.custom_background = new _p('2K3.PANEL.COLOURS.CUSTOM.BACKGROUND', _RGB(0, 0, 0));
	} else {
		this.custom_background = false;
	}
	this.list_objects = [];
	this.text_objects = [];
	this.tfo = {
		'$if2(%__@%,%path%)' : fb.TitleFormat('$if2(%__@%,%path%)')
	};
	this.font_changed();
	this.colours_changed();
}
