/*Global application configuration file. This file should be modified at the beginning of a new project*/
/* eslint-disable */
// Please customize the following attributes for your project
// Versioning
var build = "0.1.0"; 
// Basic information
var clientName = "MLApp Control Panel - UI"; // readable client name
var appName = "MLApp Control Panel - UI";
var clientAbv = "mlapp-cp-ui"; // abbreviated client name. All lower cse letters with dashes if needed
var defaultMarket = "US"; // iso_3166_alpha3 code of default market. Must be configured in markets table
var language = "en"; // language configuration of the app. The language must be supported with dictionaries. Right to left languages currently not supported
var defaultLanguage = "en"; // fallback language of the selected language above is not supported
var supportedLanguages = ["en"]; // supported languages. User can switch between these languages
var locale = "en-US"; // application locale, which controls currency and datetime formatting
var domain = "";
// Default admin
// This person will automatically be added as a superadmin user and will receive access request emails
var defaultAdmin = {
    firstName: "MLApp", 
    lastName: "CP",
    email: "mlapp@cp"
}

String.prototype.parseProp = function () {	
    var str = this;	
    var buckets_list_arr = str.split(',');	
        var obj = {};	
        for (var i=0;i<buckets_list_arr.length;i++){	
            var bucket = buckets_list_arr[i].split(":");	
            obj[bucket[0]] = bucket[1];	
        }	
        return obj;		
};

// Do not modify information below unless you know what you are doing!
const global_config = {
    "deployment": env_config.VUE_APP_DEPLOYMENT || process.env.VUE_APP_DEPLOYMENT || "default",
    "file_store_buckets": (env_config.FILE_STORE_BUCKETS || process.env.FILE_STORE_BUCKETS || "").parseProp(), 
    "app": {
        "name": clientName,
        "app_name": appName,
        "app_abbr": clientAbv,
        "version": "0.1.0",
        "build": build, // build of this client instance
        "starter_build_version": "0.1.0", // starter pack version
        "domain": domain,
        "market": defaultMarket,
        "language": language,
        "default_language": defaultLanguage,
        "supported_languages": supportedLanguages,
        "locale": locale,
        // eslint-disable-next-line
        "background_image": env_config.VUE_APP_LOGIN_BACKGROUND || process.env.VUE_APP_LOGIN_BACKGROUND,
        // eslint-disable-next-line
        "logo": env_config.VUE_APP_LOGO || process.env.VUE_APP_LOGO
    },
    "api": {
        // eslint-disable-next-line
        "base_url": env_config.VUE_APP_BASE_URL || process.env.VUE_APP_BASE_URL
    },
    // eslint-disable-next-line
    "file_storage_url": env_config.VUE_APP_FILE_STORAGE_URL || process.env.VUE_APP_FILE_STORAGE_URL,
    "admin": defaultAdmin,
    // eslint-disable-next-line
    "login_required": env_config.VUE_APP_LOGIN_REQUIRED ? (env_config.VUE_APP_LOGIN_REQUIRED.toString() == 'true') : (process.env.VUE_APP_LOGIN_REQUIRED ? (process.env.VUE_APP_LOGIN_REQUIRED.toString() == "true") : true),
    // eslint-disable-next-line
	"login_type": env_config.VUE_APP_LOGIN_TYPE || process.env.VUE_APP_LOGIN_TYPE || "basic" // basic or w3
};
export default global_config;