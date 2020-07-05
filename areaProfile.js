class AreaProfile{

    constructor(density, minWidth, maxWidth, minHeight, maxHeight){

        this.density = density;
        this.minWidth = minWidth;
        this.maxWidth = maxWidth;
        this.minHeight = minHeight;
        this.maxHeight = maxHeight;
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

}