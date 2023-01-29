class Location{
    id; 
    type;
    color;

    constructor(id, type){
        this.id = id;
        this.type = type;
        this.color = typeToColor[this.type];
    }
}