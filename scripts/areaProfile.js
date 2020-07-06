class AreaProfile{

    constructor(density, minWidth, maxWidth, minHeight, maxHeight, material){

        this.density = density;
        this.minWidth = minWidth;
        this.maxWidth = maxWidth;
        this.minHeight = minHeight;
        this.maxHeight = maxHeight;
        this.material = material;
    }

    getDensity(){
        return this.density;
    }

    getMinWidth(){
        return this.minWidth;
    }

    getMaxWidth(){
        return this.maxWidth;
    }

    getMinHeight(){
        return this.minHeight;
    }

    getMaxHeight(){
        return this.maxHeight;
    }

    getMaterial(){
        return this.material;
    }

}