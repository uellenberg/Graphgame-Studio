import Prism from "prismjs";
import "prismjs/components/prism-clike";

Prism.languages.logimat = Prism.languages.extend("clike", {
    "keyword": [
        /\b(?:import|from|export|inline|const|function|action|actions|expression|graph|point|array|polygon|state|sum|prod|if|else|true|false|null|color|display)\b/g
    ],
    "function": [
        //Template
        /[a-zA-Z_]+!/g,
        /\b(?:)templates\b/g
    ],
    "operator": />=|<=|==|!=|&&|\|\||[-+*/%^!<>]/,
    //@ts-ignore
    "template-string": {
        pattern: /`(?:\\[\s\S]|\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})+\}|(?!\$\{)[^\\`])*`/,
        greedy: true,
        inside: {
            "template-punctuation": {
                pattern: /^`|`$/,
                alias: 'string'
            },
            "interpolation": {
                pattern: /((?:^|[^\\])(?:\\{2})*)\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})+\}/,
                lookbehind: true,
                inside: {
                    "interpolation-punctuation": {
                        pattern: /^\$\{|\}$/,
                        alias: 'punctuation'
                    },
                    rest: Prism.languages.logimat
                }
            },
            "string": /[\s\S]+/
        }
    },
});