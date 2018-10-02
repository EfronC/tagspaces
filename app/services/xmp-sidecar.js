import * as fs from "fs";
import * as path from "path";
import * as xml2js from "xml2js";

export default class XmpSidecar {
    constructor(pathToFile) {
        const _this = this;
        const filePath = path.resolve(__dirname, pathToFile);
        this._filePath = path.parse(filePath);
        this._filePath.base = this._filePath.base.replace(this._filePath.ext, ".xmp");
        this._filePath.ext = ".xmp";
        if (!fs.existsSync(this.filePath)) {
            throw new Error(`XMP sidecar not found at: ${this.filePath}`);
        }
        xml2js.parseString(fs.readFileSync(this.filePath), (err, result) => {
            _this._xml = result;
        });
    }

    static load(pathToFile) {
        return new XmpSidecar(pathToFile);
    }

    get _descAttributes() {
        return this._descObject.$;
    }

    get _descObject() {
        return this.rawXml["x:xmpmeta"]["rdf:RDF"][0]["rdf:Description"][0];
    }

    get _descTags() {
        return this._descObject["dc:subject"][0];
    }

    get filePath() {
        return path.format(this._filePath);
    }

    get name() {
        return this._filePath.name;
    }

    get rating() {
        return Number(this._descAttributes["xmp:Rating"]);
    }

    set rating(value) {
        this._descAttributes["xmp:Rating"] = String(value);
    }

    get rawXml() {
        return this._xml;
    }

    get tags() {
        return this._descTags["rdf:Bag"][0]["rdf:li"];
    }

    set tags(value) {
        this._descTags["rdf:Bag"][0]["rdf:li"] = value;
    }

    addTag(tag) {
        if (!this.tags.includes(tag)) {
            this.tags.push(tag);
        }
        return this.tags;
    }

    getAttribute(name) {
        return this._descAttributes[name];
    }

    hasAttribute(name) {
        return this._descAttributes[name] !== undefined;
    }

    hasTag(tag) {
        return this.tags.includes(tag);
    }

    removeAttribute(name) {
        delete this._descAttributes[name];
        return this._descAttributes;
    }

    removeTag(tag) {
        this.tags = this.tags.filter(item => item !== tag);
        return this.tags;
    }

    save(filePath) {
        const builder = new xml2js.Builder();
        if (filePath) {
            filePath = path.resolve(__dirname, filePath);
        }
        filePath = filePath || path.format(this._filePath);
        fs.writeFileSync(filePath, builder.buildObject(this.rawXml));
        return new XmpSidecar(filePath);
    }

    setAttribute(name, value) {
        this._descAttributes[name] = value;
        return this._descAttributes;
    }
}

