import defaultLogo from "../assets/logo/earth-icon.png";
import cosmicLogo from "../assets/logo/favicon-new.png";
import finRiseLogo from "../assets/logo/finrise-logo.png";
import spectraFavIcon from "../assets/logo/spectraFavIcon.jpg";
import galaxylogoIcon from "../assets/logo/galaxy-logo.png";


// const baseUrl = import.meta.env.VITE_REACT_APP_TYPE === "development" ? "./src/assets/Icon/" : "/assets/"

const favIconMap = {
    "cosmic": cosmicLogo,
    "finrise": finRiseLogo,
    "spectra": spectraFavIcon,
    "galaxy": galaxylogoIcon

}


export const updateFavicon = (isLogo, logo) => {
    var head = document.getElementById('logo');
    if (!isLogo) return head.href = defaultLogo

    if (import.meta.env.VITE_REACT_APP_COMPANY) logo = import.meta.env.VITE_REACT_APP_COMPANY



    head.href = favIconMap[logo] ?? defaultLogo
}