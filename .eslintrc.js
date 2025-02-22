module.exports = {
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends": ["airbnb", "prettier"],
    "plugins": ["prettier"],
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "rules": {
        "no-console": "off"
    }
}