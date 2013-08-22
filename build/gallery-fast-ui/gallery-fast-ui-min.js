YUI.add("gallery-fast-ui",function(Y,NAME){function WidgetConfigProperty(e,t,n){this.name=e,this.value=t,this.type=n}function WidgetDefinition(e,t,n){this.nodeId=e,this.className=t,this.config=n}function WidgetConfig(e,t,n){this.properties=e?e:{},this.globalConfigKey=t,this.srcNode=n}function readConfigFromAttributes(e,t,n){var r,i,s,o,u;for(u=0;u<n.attributes.length;u++){r=n.attributes[u],i=r.localName||r.baseName,s=r.value,o=r.namespaceURI?r.namespaceURI:null;if(i==="config-key"&&o==="fastui"){t.globalConfigKey=s;continue}if(i==="srcNode"&&o==="fastui"){t.srcNode=s,t.addProperty("srcNode","#"+e);continue}if(i==="id"||!!o)continue;t.addProperty(i,s)}}function readConfigFromElements(e,t){var n,r,i,s,o;for(o=0;o<t.length;o++)n=t[o],r=n.getAttribute("name"),s=n.getAttribute("type"),s=s?s:"js",i=extractContents(n,s),e.addProperty(r,i,s)}function extractContents(e,t){return"ui"===t?getUiNodeAsString(e):"js"===t?getJsNodeAsString(e):getStringNodeAsString(e)}function getUiNodeAsString(e){var t,n="<span>";for(t=0;t<e.childNodes.length;t++)n+=Y.XML.format(e.childNodes[t]);return n+="</span>",n}function getJsNodeAsString(e){return e.textContent||e.text}function getStringNodeAsString(e){return e.textContent||e.text}function ParserResult(e,t,n){this.variables=e,this.widgetDefinitions=t,this.htmlContent=n}function TemplateParser(){this.variables={},this.widgets=[],this.htmlContent=""}function FastUiBuilder(e,t,n,r){this.parent=e?Y.one(e):null,this.xmlContent=t,this.msg=n,this.globalConfig=r}function mix(e){var t,n;for(t=1;t<arguments.length;t++)for(n in arguments[t])arguments[t].hasOwnProperty(n)&&(e[n]=arguments[t][n])}WidgetConfig.prototype.addProperty=function(e,t,n){n=n?n:"string",this.properties[e]=new WidgetConfigProperty(e,t,n)},WidgetConfig.buildFromElement=function(e,t,n){var r=new WidgetConfig;return readConfigFromAttributes(e,r,t),readConfigFromElements(r,n),r},TemplateParser.prototype.parse=function(e){var t=Y.XML.parse(e);return this.traverseElement(t.firstChild),this.htmlContent=Y.XML.format(t.firstChild),new ParserResult(this.variables,this.widgets,this.htmlContent)},TemplateParser.prototype.traverseElement=function(e){var t,n,r=[],i,s=!1;for(t=0;t<e.childNodes.length;t++){n=e.childNodes[t];if(n.nodeType===1){if(this.isConfigElement(n)){r.push(n);continue}this.traverseElement(n)}}for(t=0;t<r.length;t++)e.removeChild(r[t]);i=this.getId(e),s=this.registerVariable(e,i)||s,s=this.registerWidget(e,i,r)||s,s&&this._ensureElementHasId(e,i)},TemplateParser.prototype._ensureElementHasId=function(e,t){this.getAttribute(e,"id")||e.setAttribute("id",t)},TemplateParser.prototype.registerVariable=function(e,t){var n=this.getAttribute(e,"field","fastui");return n?(this.variables[n]=t,!0):!1},TemplateParser.prototype.isConfigElement=function(e){var t=e.localName||e.baseName;return e.namespaceURI&&e.namespaceURI==="fastui"&&t==="config"},TemplateParser.prototype.registerWidget=function(e,t,n){if(!e.namespaceURI)return!1;var r=e.localName||e.baseName,i,s=e.namespaceURI+"."+r,o=new WidgetDefinition(t,s,WidgetConfig.buildFromElement(t,e,n));return i=this.createPlaceHolderElement(e,t),this.widgets.push(o),e.parentNode.replaceChild(i,e),!0},TemplateParser.prototype.getAttribute=function(e,t,n){var r,i,s;if(!e.attributes)return null;n=n?n:null;for(r=0;r<e.attributes.length;r++){i=e.attributes[r],s=i.localName||i.baseName;if(s===t&&i.namespaceURI===n)return i.value}return null},TemplateParser.prototype.getId=function(e){var t=this.getAttribute(e,"id");return t||(t=Y.guid("fast-ui-")),t},TemplateParser.prototype.getElementType=function(e){var t=this.getAttribute(e,"srcNode","fastui");return t?t:"span"},TemplateParser.prototype.createPlaceHolderElement=function(e,t){var n=e.ownerDocument,r=this.getElementType(e),i=n.createElement(r),s;i.setAttribute("id",t);while(!!(s=e.firstChild))e.removeChild(s),i.appendChild(s);return i},TemplateParser.prototype.setAttribute=function(e,t,n){Y.one(e).setAttribute(t,n)},FastUiBuilder.prototype.parse=function(){var e=this._parseXmlTemplate(),t=e.variables,n=e.widgetDefinitions,r,i,s,o;this.rootNode=this._createRootDomNode(e),this.createdWidgets={},this.result={};for(o=n.length-1;o>=0;o--)r=this._createWidget(n[o]),this.createdWidgets[n[o].nodeId]=r;for(i in t)t.hasOwnProperty(i)&&(s=t[i],this.result[i]=this._getWidgetOrNode(s));return this.result._rootNode=this.rootNode,this.parent?this.parent.appendChild(this.rootNode):Y.one("body").removeChild(this.rootNode),this.result},FastUiBuilder.prototype._parseXmlTemplate=function(){var e=this.msg?Y.Lang.sub(this.xmlContent,this.msg):this.xmlContent;return(new TemplateParser).parse(e)},FastUiBuilder.prototype._createRootDomNode=function(e){var t=e.htmlContent,n=t.replace(/<([\w\d]+?)\s+([^>]+?)\/>/gm,"<$1 $2></$1>"),r;return r=Y.Node.create(n),Y.one("body").appendChild(r),r},FastUiBuilder.prototype._getWidgetOrNode=function(e){var t=this.createdWidgets[e];return t?t:this.rootNode.one("#"+e)},FastUiBuilder.prototype._createWidget=function(e){var t=this._getClassConstructor(e.className),n=this._getClassConfig(e.config),r=new t(n),i;return e.config.srcNode?r.render():(i=this._findElement(e.nodeId),r.render(i)),e.nodeId===this.rootNode.get("id")&&(this.rootNode=r.get("boundingBox")),r},FastUiBuilder.prototype._findElement=function(e){return this.rootNode.get("id")===e?this.rootNode:this.rootNode.one("#"+e)},FastUiBuilder.prototype._getClassConstructor=function(e){if(/^Y\./.test(e)){var t=/^Y\.((.*)\.)?(.*?)$/.exec(e),n=t[2],r=t[3];return n?Y.namespace(n)[r]:Y[r]}},FastUiBuilder.prototype._getClassConfig=function(e){var t,n={};return mix(n,this._evaluateProperties(e.properties)),this.globalConfig&&e.globalConfigKey&&(t=this.globalConfig[e.globalConfigKey],mix(n,t)),n},FastUiBuilder.prototype._evaluateProperties=function(e){var t,n={};for(t in e)e.hasOwnProperty(t)&&(n[t]=this.evaluatePropertyValue(e[t],null));return n},FastUiBuilder.prototype.evaluatePropertyValue=function(widgetConfigProperty,config){if("string"===widgetConfigProperty.type&&"srcNode"===
widgetConfigProperty.name)return this.rootNode.one(widgetConfigProperty.value);if("string"===widgetConfigProperty.type)return widgetConfigProperty.value;if("ui"===widgetConfigProperty.type){var builtUi=(new FastUiBuilder(null,widgetConfigProperty.value,null,config)).parse();return mix(this.result,builtUi),builtUi._rootNode}if("js"===widgetConfigProperty.type)return eval(widgetConfigProperty.value)},Y.fastUi=function(e,t,n,r){return(new FastUiBuilder(e,t,n,r)).parse()},Y.lazyUi=function(e,t,n,r,i){var s,o;return o=function(){return s?s:(s=Y.fastUi(e,t,n,i),!r||r(s),s)},o}},"0.2",{requires:["datatype-xml","node","widget","yui-base"]});