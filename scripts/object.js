class GameObject {

    id;
    //Type of object. 
    type;
    isObstacle;
    color;
    shape;
    //location which will get update
    loc;
    //fix attribute indepedent of type
    weight;     //[1,10] corresponding to str
    fragility;  //[1,10] corresponding to dex

    constructor(id, type, isObstacle, shape, weight, fragility) {
        this.id = id;
        this.type = type;
        this.isObstacle = isObstacle;
        this.color = typeToColor[this.type];
        this.shape = shape; 
        this.weight = weight;
        this.fragility = fragility;
    }

}