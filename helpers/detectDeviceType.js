import {Constants} from "./constant";


/**
 * Detects the type of device based on the provided device information.
 * @param {Object} deviceInfo - The device information object.
 * @param {boolean} [deviceInfo.isYaBrowser] - Whether the device is running on Yandex browser.
 * @param {boolean} [deviceInfo.isAuthoritative] - Whether the device is authoritative.
 * @param {boolean} [deviceInfo.isMobile] - Whether the device is a mobile device.
 * @param {boolean} [deviceInfo.isMobileNative] - Whether the device is a native mobile device.
 * @param {boolean} [deviceInfo.isTablet] - Whether the device is a tablet.
 * @param {boolean} [deviceInfo.isiPad] - Whether the device is an iPad.
 * @param {boolean} [deviceInfo.isiPod] - Whether the device is an iPod.
 * @param {boolean} [deviceInfo.isiPhone] - Whether the device is an iPhone.
 * @param {boolean} [deviceInfo.isiPhoneNative] - Whether the device is a native iPhone.
 * @param {boolean} [deviceInfo.isAndroid] - Whether the device is an Android device.
 * @param {boolean} [deviceInfo.isAndroidNative] - Whether the device is a native Android device.
 * @param {boolean} [deviceInfo.isBlackberry] - Whether the device is a Blackberry device.
 * @param {boolean} [deviceInfo.isDesktop] - Whether the device is a desktop.
 * @param {boolean} [deviceInfo.isWindows] - Whether the desktop device is running Windows OS.
 * @param {boolean} [deviceInfo.isLinux] - Whether the desktop device is running Linux OS.
 * @param {boolean} [deviceInfo.isLinux64] - Whether the desktop device is running 64-bit Linux OS.
 * @param {boolean} [deviceInfo.isMac] - Whether the desktop device is running macOS.
 * @param {boolean} [deviceInfo.isChromeOS] - Whether the desktop device is running Chrome OS.
 * @param {boolean} [deviceInfo.isBada] - Whether the device is running Bada OS.
 * @param {boolean} [deviceInfo.isSamsung] - Whether the device is manufactured by Samsung.
 * @param {boolean} [deviceInfo.isRaspberry] - Whether the device is a Raspberry Pi.
 * @param {boolean} [deviceInfo.isBot] - Whether the device is a bot.
 * @param {boolean} [deviceInfo.isCurl] - Whether the device is using cURL.
 * @param {boolean} [deviceInfo.isAndroidTablet] - Whether the device is an Android tablet.
 * @param {boolean} [deviceInfo.isWinJs] - Whether the device is running WinJS.
 * @param {boolean} [deviceInfo.isKindleFire] - Whether the device is a Kindle Fire.
 * @param {boolean} [deviceInfo.isSilk] - Whether the device is running Silk browser.
 * @param {boolean} [deviceInfo.isCaptive] - Whether the device is in captive portal.
 * @param {boolean} [deviceInfo.isSmartTV] - Whether the device is a Smart TV.
 * @param {boolean} [deviceInfo.isUC] - Whether the device is using UC browser.
 * @param {boolean} [deviceInfo.isFacebook] - Whether the device is using Facebook browser.
 * @param {boolean} [deviceInfo.isAlamoFire] - Whether the device is using AlamoFire.
 * @param {boolean} [deviceInfo.isElectron] - Whether the device is using Electron framework.
 * @param {boolean} [deviceInfo.silkAccelerated] - Whether Silk browser acceleration is enabled.
 * @param {string} [deviceInfo.browser] - The browser name.
 * @param {string} [deviceInfo.version] - The browser version.
 * @param {string} [deviceInfo.os] - The operating system.
 * @param {string} [deviceInfo.platform] - The platform.
 * @param {Object} [deviceInfo.geoIp] - The geographic location information.
 * @param {string} [deviceInfo.source] - The user agent string.
 * @param {boolean} [deviceInfo.isWechat] - Whether the device is using WeChat browser.
 * @param {string} [deviceInfo.electronVersion] - The Electron framework version.
 * @returns {'desktop' | 'mobile' | 'tablet' | 'other'} - The type of device: 'desktop', 'mobile', 'tablet', or 'other'.
 */

function detectDeviceType(deviceInfo) {
    return deviceInfo.isDesktop ? Constants.DESKTOP : deviceInfo.isMobile || deviceInfo.isAndroid || deviceInfo.isiPhone || deviceInfo.isAndroidNative || deviceInfo.isiPhoneNative || deviceInfo.isBlackberry ? Constants.MOBILE : deviceInfo.isiPad || deviceInfo.isiPod || deviceInfo.isAndroidTablet ? Constants.TABLET : Constants.OTHERS;
}

export default detectDeviceType