function TemplateParser() {
    this.variables = [];
    this.widgets = [];
    this.htmlContent = "";
}

TemplateParser.prototype.parse = function (xmlContent) {
    var xmlDoc = Y.XML.parse(xmlContent);

    this.traverseElement(xmlDoc.firstChild);

    this.htmlContent = Y.XML.format(xmlDoc.firstChild);

    return {
        variables: this.variables,
        widgetDefinitions: this.widgets,
        htmlContent: this.htmlContent
    };
};

/**
 * Recursively traverses the XML document, binding variables and instantiating widgetDefinitions.
 * @param element Start element.
 */
TemplateParser.prototype.traverseElement = function (element) {
    var i, childElement;

    for (i = 0; i < element.childNodes.length; i++) {
        childElement = element.childNodes[i];
        // IE up to 8 incorrectly counts comment nodes
        if (childElement.nodeType === 1) {
            this.traverseElement(childElement);
        }
    }


    this.checkVariable(element);
    this.checkWidget(element);
};

TemplateParser.prototype.checkVariable = function(element) {
    var uiField = this.getAttribute(element, 'ui-field');

    if (uiField) {
        this.variables[uiField] = this.getId(element);
    }
};

TemplateParser.prototype.checkWidget = function(element) {
    // there is a namespace URI, we need to create a WidgetDefinition
    if (!element.namespaceURI) {
        return;
    }

    var elementName = element.localName || element.baseName,
        fullClassName = element.namespaceURI + "." + elementName,
        widget = {
            nodeId: this.getId(element),
            className: fullClassName,
            config: WidgetConfig.buildFromElement(element)
        },
        placeHolderElement = this.createPlaceHolderElement(element);

    this.widgets.push(widget);

    element.parentNode.replaceChild(placeHolderElement, element);
};


TemplateParser.prototype.getAttribute = function(element, attributeName) {
    var i;

    if (!element.attributes) {
        return null;
    }

    for (i = 0; i < element.attributes.length; i++) {
        if (element.attributes[i].name === attributeName) {
            return element.attributes[i].value;
        }
    }

    return null;
};

TemplateParser.prototype.getId = function(element) {
    var id = this.getAttribute(element, 'id');

    // if the element does not have an id, we create one
    if (id === null) {
        id = Y.guid('fast-ui-');
        element.setAttribute('id', id);
    }

    return id;
};

TemplateParser.prototype.getElementType = function(element) {
    var srcNodeType = this.getAttribute(element, "ui-src");

    return srcNodeType ? srcNodeType : "span";
};

TemplateParser.prototype.createPlaceHolderElement = function(sourceElement) {
    var document = sourceElement.ownerDocument,
        elementType = this.getElementType(sourceElement),
        id = this.getAttribute(sourceElement, 'id'),
        newElement = document.createElement(elementType),
        child;

    newElement.setAttribute('id', id);

    while (!!(child = sourceElement.firstChild)) {
        sourceElement.removeChild(child);
        newElement.appendChild(child);
    }

    return newElement;
};