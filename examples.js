function Examples(examplesList, editorBox, loadBtn){
    this.examplesList = examplesList;
    this.editorBox = editorBox;
    this.loadBtn = loadBtn;
    this.exampleCode = {
        "Conway's Game of Life": "getPalette = function(){\n    return [\"black\", \"white\"];\n}\n\ngetNextColor = function(x, y){\n    var count = rectNeighborCount(x, y, 1, 1, \"white\");\n    if(getColor(x, y) == \"white\"){\n        if(count == 2 || count == 3){\n            return \"white\";\n        }\n        else{\n            return \"black\";\n        }\n    }\n    else{\n        if(count == 3){\n            return \"white\";\n        }\n        else{\n            return \"black\";\n        }\n    }\n}",
        "Brian's Brain": "getPalette = function(){\n    return [\"black\", \"white\", \"blue\"];\n};\n\ngetNextColor = function(x, y){\n    var color = getColor(x, y);\n    if(color == \"black\"){\n        if(rectNeighborCount(x, y, 1, 1, \"white\") == 2){\n            return \"white\";\n        }\n    }\n    else if(color == \"white\"){\n        return \"blue\";\n    }\n    return \"black\";\n};",
        "Seeds": "getPalette = function(){\n    return [\"black\", \"white\"];\n}\n\ngetNextColor = function(x, y){\n    if(getColor(x, y) == \"black\"){\n        if(rectNeighborCount(x, y, 1, 1, \"white\") == 2){\n            return \"white\";\n        }\n    }\n    return \"black\";\n}",
        "Custom": "getPalette = function(){\n    return [];\n}\n\ngetNextColor = function(x, y){\n}"
    };
    this.addExamples();
}

Examples.prototype.addExample = function(name){
    var _this = this;
    var item = document.createElement("button");
    item.innerText = name;
    item.onclick = function(ev){
        _this.editorBox.value = _this.exampleCode[name];
        _this.loadBtn.disabled = false;
    };
    this.examplesList.appendChild(item);
};

Examples.prototype.addExamples = function(){
    var keys = Object.keys(this.exampleCode);
    for(var i = 0; i < keys.length; i++){
        this.addExample(keys[i]);
    }
    this.editorBox.value = this.exampleCode[keys[0]];
};