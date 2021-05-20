function Editor(editorBox){
    this.editorBox = editorBox;

    var _this = this;

    editorBox.addEventListener("keydown", function(ev){
        if(ev.key == "Tab"){
            ev.preventDefault();
            _this.insertAtSelection("    ");
        }
        else if(ev.key == "("){
            _this.insertAtSelection(")", false);
        }
        else if(ev.key == "{"){
            _this.insertAtSelection("}", false);
        }
        else if(ev.key == "\""){
            if(editorBox.selectionStart == editorBox.selectionEnd){
                if(!_this.getPreCarrotLine().trim().endsWith("\\")){
                    _this.insertAtSelection("\"", false);
                }
            }
        }
        else if(ev.key == "Enter"){
            ev.preventDefault();
            var space = "";
            var tabs = _this.getLineTabs();
            var blockStart = false;
            if(_this.getPreCarrotLine().trim().endsWith("{")){
                blockStart = true;
            }
            for(var i = 0; i < tabs; i++){
                space += "    ";
            }
            _this.insertAtSelection("\n" + space);
            if(blockStart){
                _this.insertAtSelection("    ");
                _this.insertAtSelection("\n" + space, false)
            }
        }
        else if(ev.key == "Backspace"){
            if(editorBox.selectionStart == editorBox.selectionEnd){
                if((_this.getCharBefore() == "{" && _this.getCharAfter() == "}") 
                || (_this.getCharBefore() == "(" && _this.getCharAfter() == ")")
                || (_this.getCharBefore() == "\"" && _this.getCharAfter() == "\"")){
                    ev.preventDefault();
                    _this.removeAtSelection(1);
                    _this.removeAtSelection(1, false);
                }
                else{
                    var line = _this.getPreCarrotLine();
                    if(line.length > 0 && line.length % 4 == 0 && line.trim().length == 0){
                        ev.preventDefault();
                        _this.removeAtSelection(4);
                    }
                }
            }
        }
    });
};

Editor.prototype.insertAtSelection = function(str, moveCarrot = true){
    var start = this.editorBox.selectionStart;
    var end = this.editorBox.selectionEnd;
    this.editorBox.value = this.editorBox.value.substring(0, start) + str + this.editorBox.value.substring(end);
    var final = Math.min(start, end) + (moveCarrot ? str.length : 0);
    this.editorBox.selectionStart = final;
    this.editorBox.selectionEnd = final;
};

Editor.prototype.removeAtSelection = function(count, beforeCarrot = true){
    var start = Math.min(this.editorBox.selectionStart, this.editorBox.selectionEnd);
    var end = Math.max(this.editorBox.selectionStart, this.editorBox.selectionEnd);
    var removeStart;
    var removeEnd;
    if(beforeCarrot){
        removeStart = Math.max(start - count, 0);
        removeEnd = end;
    }
    else{
        removeStart = start;
        removeEnd = Math.min(end + count, editorBox.value.length);
    }
    this.editorBox.value = this.editorBox.value.substring(0, removeStart) + this.editorBox.value.substring(removeEnd);
    this.editorBox.selectionStart = removeStart;
    this.editorBox.selectionEnd = removeStart;
};

Editor.prototype.findLineStart = function(){
    var index = this.editorBox.selectionStart - 1;
    while(index >= 0 && this.editorBox.value.charAt(index) != "\n"){
        index--;
    }
    return index + 1;
};

Editor.prototype.getPreCarrotLine = function(){
    return this.editorBox.value.substring(this.findLineStart(), this.editorBox.selectionStart);
};

Editor.prototype.getLineTabs = function(){
    var spaces = 0;
    var index = this.findLineStart();
    while(index < this.editorBox.value.length && this.editorBox.value.charAt(index) == " "){
        index++;
        spaces++;
    }
    return Math.floor(spaces / 4);
};

Editor.prototype.getCharBefore = function(){
    return this.editorBox.value.charAt(this.editorBox.selectionStart - 1);
};

Editor.prototype.getCharAfter = function(){
    return this.editorBox.value.charAt(this.editorBox.selectionStart);
};