"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DescribePersonMachineListResponseBodyPersonMachineRes = exports.DescribePersonMachineListResponseBodyPersonMachineResPersonMachines = exports.DescribeEarlyWarningResponseBodyEarlyWarnings = exports.DescribeConfigNameResponseBodyConfigNames = exports.DescribeCaptchaMinResponseBodyCaptchaMins = exports.DescribeCaptchaIpCityResponseBodyCaptchaCities = exports.DescribeCaptchaIpCityResponseBodyCaptchaIps = exports.DescribeCaptchaDayResponseBodyCaptchaDay = exports.DescribeAfsVerifySigDataResponseBodyNcSigDatas = exports.DescribeAfsVerifySigDataResponseBodyIcSecVerifyDatas = exports.DescribeAfsVerifySigDataResponseBodyNvcVerifyDatas = exports.DescribeAfsVerifySigDataResponseBodyNcVerifyDatas = exports.DescribeAfsVerifySigDataResponseBodyIcVerifyDatas = exports.DescribeAfsVerifySigDataResponseBodyNvcSecDatas = exports.DescribeAfsVerifySigDataResponseBodyNvcCodeDatas = exports.DescribeAfsTotalConfDataResponseBodyNcTotalConfVerifyDatas = exports.DescribeAfsTotalConfDataResponseBodyNcTotalConfSigDatas = exports.DescribeAfsTotalConfDataResponseBodyIcTotalConfBlockDatas = exports.DescribeAfsTotalConfDataResponseBodyNcTotalConfBlockDatas = exports.DescribeAfsTotalConfDataResponseBodyIcTotalConfSecVerifyDatas = exports.DescribeAfsTotalConfDataResponseBodyNvcTotalConfVerifyDatas = exports.DescribeAfsTotalConfDataResponseBodyIcTotalConfVerifyDatas = exports.DescribeAfsTotalConfDataResponseBodyNvcTotalConfSecVerifyDatas = exports.DescribeAfsTotalConfDataResponseBodyIcTotalConfSigDatas = exports.DescribeAfsOneConfDataResponseBodyNvcOneConfDatas = exports.DescribeAfsOneConfDataResponseBodyNcOneConfDatas = exports.DescribeAfsOneConfDataResponseBodyIcOneConfDatas = exports.DescribeAfsConfigNameResponseBodyConfigNames = exports.ConfigurationStyleResponseBodyCodeData = exports.UpdateConfigNameResponse = exports.UpdateConfigNameResponseBody = exports.UpdateConfigNameRequest = exports.SetEarlyWarningResponse = exports.SetEarlyWarningResponseBody = exports.SetEarlyWarningRequest = exports.DescribePersonMachineListResponse = exports.DescribePersonMachineListResponseBody = exports.DescribePersonMachineListRequest = exports.DescribeOrderInfoResponse = exports.DescribeOrderInfoResponseBody = exports.DescribeOrderInfoRequest = exports.DescribeEarlyWarningResponse = exports.DescribeEarlyWarningResponseBody = exports.DescribeEarlyWarningRequest = exports.DescribeConfigNameResponse = exports.DescribeConfigNameResponseBody = exports.DescribeConfigNameRequest = exports.DescribeCaptchaRiskResponse = exports.DescribeCaptchaRiskResponseBody = exports.DescribeCaptchaRiskRequest = exports.DescribeCaptchaOrderResponse = exports.DescribeCaptchaOrderResponseBody = exports.DescribeCaptchaOrderRequest = exports.DescribeCaptchaMinResponse = exports.DescribeCaptchaMinResponseBody = exports.DescribeCaptchaMinRequest = exports.DescribeCaptchaIpCityResponse = exports.DescribeCaptchaIpCityResponseBody = exports.DescribeCaptchaIpCityRequest = exports.DescribeCaptchaDayResponse = exports.DescribeCaptchaDayResponseBody = exports.DescribeCaptchaDayRequest = exports.DescribeAfsVerifySigDataResponse = exports.DescribeAfsVerifySigDataResponseBody = exports.DescribeAfsVerifySigDataRequest = exports.DescribeAfsTotalConfDataResponse = exports.DescribeAfsTotalConfDataResponseBody = exports.DescribeAfsTotalConfDataRequest = exports.DescribeAfsOneConfDataResponse = exports.DescribeAfsOneConfDataResponseBody = exports.DescribeAfsOneConfDataRequest = exports.DescribeAfsConfigNameResponse = exports.DescribeAfsConfigNameResponseBody = exports.DescribeAfsConfigNameRequest = exports.CreateConfigurationResponse = exports.CreateConfigurationResponseBody = exports.CreateConfigurationRequest = exports.ConfigurationStyleResponse = exports.ConfigurationStyleResponseBody = exports.ConfigurationStyleRequest = exports.AuthenticateSigResponse = exports.AuthenticateSigResponseBody = exports.AuthenticateSigRequest = exports.AnalyzeNvcResponse = exports.AnalyzeNvcResponseBody = exports.AnalyzeNvcRequest = void 0;
// This file is auto-generated, don't edit it
/**
 *
 */
const tea_util_1 = __importStar(require("@alicloud/tea-util")), $Util = tea_util_1;
const openapi_client_1 = __importStar(require("@alicloud/openapi-client")), $OpenApi = openapi_client_1;
const endpoint_util_1 = __importDefault(require("@alicloud/endpoint-util"));
const $tea = __importStar(require("@alicloud/tea-typescript"));
class AnalyzeNvcRequest extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            sourceIp: 'SourceIp',
            scoreJsonStr: 'ScoreJsonStr',
            data: 'Data',
        };
    }
    static types() {
        return {
            sourceIp: 'string',
            scoreJsonStr: 'string',
            data: 'string',
        };
    }
}
exports.AnalyzeNvcRequest = AnalyzeNvcRequest;
class AnalyzeNvcResponseBody extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            requestId: 'RequestId',
            bizCode: 'BizCode',
        };
    }
    static types() {
        return {
            requestId: 'string',
            bizCode: 'string',
        };
    }
}
exports.AnalyzeNvcResponseBody = AnalyzeNvcResponseBody;
class AnalyzeNvcResponse extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            headers: 'headers',
            body: 'body',
        };
    }
    static types() {
        return {
            headers: { 'type': 'map', 'keyType': 'string', 'valueType': 'string' },
            body: AnalyzeNvcResponseBody,
        };
    }
}
exports.AnalyzeNvcResponse = AnalyzeNvcResponse;
class AuthenticateSigRequest extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            sourceIp: 'SourceIp',
            sessionId: 'SessionId',
            appKey: 'AppKey',
            sig: 'Sig',
            token: 'Token',
            scene: 'Scene',
            remoteIp: 'RemoteIp',
        };
    }
    static types() {
        return {
            sourceIp: 'string',
            sessionId: 'string',
            appKey: 'string',
            sig: 'string',
            token: 'string',
            scene: 'string',
            remoteIp: 'string',
        };
    }
}
exports.AuthenticateSigRequest = AuthenticateSigRequest;
class AuthenticateSigResponseBody extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            msg: 'Msg',
            requestId: 'RequestId',
            riskLevel: 'RiskLevel',
            code: 'Code',
            detail: 'Detail',
        };
    }
    static types() {
        return {
            msg: 'string',
            requestId: 'string',
            riskLevel: 'string',
            code: 'number',
            detail: 'string',
        };
    }
}
exports.AuthenticateSigResponseBody = AuthenticateSigResponseBody;
class AuthenticateSigResponse extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            headers: 'headers',
            body: 'body',
        };
    }
    static types() {
        return {
            headers: { 'type': 'map', 'keyType': 'string', 'valueType': 'string' },
            body: AuthenticateSigResponseBody,
        };
    }
}
exports.AuthenticateSigResponse = AuthenticateSigResponse;
class ConfigurationStyleRequest extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            sourceIp: 'SourceIp',
            applyType: 'ApplyType',
            scene: 'Scene',
            configurationMethod: 'ConfigurationMethod',
            refExtId: 'RefExtId',
        };
    }
    static types() {
        return {
            sourceIp: 'string',
            applyType: 'string',
            scene: 'string',
            configurationMethod: 'string',
            refExtId: 'string',
        };
    }
}
exports.ConfigurationStyleRequest = ConfigurationStyleRequest;
class ConfigurationStyleResponseBody extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            codeData: 'CodeData',
            requestId: 'RequestId',
            bizCode: 'BizCode',
        };
    }
    static types() {
        return {
            codeData: ConfigurationStyleResponseBodyCodeData,
            requestId: 'string',
            bizCode: 'string',
        };
    }
}
exports.ConfigurationStyleResponseBody = ConfigurationStyleResponseBody;
class ConfigurationStyleResponse extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            headers: 'headers',
            body: 'body',
        };
    }
    static types() {
        return {
            headers: { 'type': 'map', 'keyType': 'string', 'valueType': 'string' },
            body: ConfigurationStyleResponseBody,
        };
    }
}
exports.ConfigurationStyleResponse = ConfigurationStyleResponse;
class CreateConfigurationRequest extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            sourceIp: 'SourceIp',
            configurationName: 'ConfigurationName',
            applyType: 'ApplyType',
            scene: 'Scene',
            maxPV: 'MaxPV',
            configurationMethod: 'ConfigurationMethod',
        };
    }
    static types() {
        return {
            sourceIp: 'string',
            configurationName: 'string',
            applyType: 'string',
            scene: 'string',
            maxPV: 'string',
            configurationMethod: 'string',
        };
    }
}
exports.CreateConfigurationRequest = CreateConfigurationRequest;
class CreateConfigurationResponseBody extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            refExtId: 'RefExtId',
            requestId: 'RequestId',
            bizCode: 'BizCode',
        };
    }
    static types() {
        return {
            refExtId: 'string',
            requestId: 'string',
            bizCode: 'string',
        };
    }
}
exports.CreateConfigurationResponseBody = CreateConfigurationResponseBody;
class CreateConfigurationResponse extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            headers: 'headers',
            body: 'body',
        };
    }
    static types() {
        return {
            headers: { 'type': 'map', 'keyType': 'string', 'valueType': 'string' },
            body: CreateConfigurationResponseBody,
        };
    }
}
exports.CreateConfigurationResponse = CreateConfigurationResponse;
class DescribeAfsConfigNameRequest extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            sourceIp: 'SourceIp',
            productName: 'ProductName',
        };
    }
    static types() {
        return {
            sourceIp: 'string',
            productName: 'string',
        };
    }
}
exports.DescribeAfsConfigNameRequest = DescribeAfsConfigNameRequest;
class DescribeAfsConfigNameResponseBody extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            requestId: 'RequestId',
            configNames: 'ConfigNames',
            bizCode: 'BizCode',
            hasData: 'HasData',
        };
    }
    static types() {
        return {
            requestId: 'string',
            configNames: { 'type': 'array', 'itemType': DescribeAfsConfigNameResponseBodyConfigNames },
            bizCode: 'string',
            hasData: 'boolean',
        };
    }
}
exports.DescribeAfsConfigNameResponseBody = DescribeAfsConfigNameResponseBody;
class DescribeAfsConfigNameResponse extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            headers: 'headers',
            body: 'body',
        };
    }
    static types() {
        return {
            headers: { 'type': 'map', 'keyType': 'string', 'valueType': 'string' },
            body: DescribeAfsConfigNameResponseBody,
        };
    }
}
exports.DescribeAfsConfigNameResponse = DescribeAfsConfigNameResponse;
class DescribeAfsOneConfDataRequest extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            sourceIp: 'SourceIp',
            appKey: 'AppKey',
            scene: 'Scene',
            productName: 'ProductName',
        };
    }
    static types() {
        return {
            sourceIp: 'string',
            appKey: 'string',
            scene: 'string',
            productName: 'string',
        };
    }
}
exports.DescribeAfsOneConfDataRequest = DescribeAfsOneConfDataRequest;
class DescribeAfsOneConfDataResponseBody extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            requestId: 'RequestId',
            icOneConfDatas: 'IcOneConfDatas',
            ncOneConfDatas: 'NcOneConfDatas',
            nvcOneConfDatas: 'NvcOneConfDatas',
            bizCode: 'BizCode',
            hasData: 'HasData',
        };
    }
    static types() {
        return {
            requestId: 'string',
            icOneConfDatas: { 'type': 'array', 'itemType': DescribeAfsOneConfDataResponseBodyIcOneConfDatas },
            ncOneConfDatas: { 'type': 'array', 'itemType': DescribeAfsOneConfDataResponseBodyNcOneConfDatas },
            nvcOneConfDatas: { 'type': 'array', 'itemType': DescribeAfsOneConfDataResponseBodyNvcOneConfDatas },
            bizCode: 'string',
            hasData: 'boolean',
        };
    }
}
exports.DescribeAfsOneConfDataResponseBody = DescribeAfsOneConfDataResponseBody;
class DescribeAfsOneConfDataResponse extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            headers: 'headers',
            body: 'body',
        };
    }
    static types() {
        return {
            headers: { 'type': 'map', 'keyType': 'string', 'valueType': 'string' },
            body: DescribeAfsOneConfDataResponseBody,
        };
    }
}
exports.DescribeAfsOneConfDataResponse = DescribeAfsOneConfDataResponse;
class DescribeAfsTotalConfDataRequest extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            sourceIp: 'SourceIp',
            productName: 'ProductName',
        };
    }
    static types() {
        return {
            sourceIp: 'string',
            productName: 'string',
        };
    }
}
exports.DescribeAfsTotalConfDataRequest = DescribeAfsTotalConfDataRequest;
class DescribeAfsTotalConfDataResponseBody extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            requestId: 'RequestId',
            icTotalConfSigDatas: 'IcTotalConfSigDatas',
            nvcTotalConfSecVerifyDatas: 'NvcTotalConfSecVerifyDatas',
            icTotalConfVerifyDatas: 'IcTotalConfVerifyDatas',
            nvcTotalConfVerifyDatas: 'NvcTotalConfVerifyDatas',
            icTotalConfSecVerifyDatas: 'IcTotalConfSecVerifyDatas',
            ncTotalConfBlockDatas: 'NcTotalConfBlockDatas',
            icTotalConfBlockDatas: 'IcTotalConfBlockDatas',
            ncTotalConfSigDatas: 'NcTotalConfSigDatas',
            bizCode: 'BizCode',
            hasData: 'HasData',
            ncTotalConfVerifyDatas: 'NcTotalConfVerifyDatas',
        };
    }
    static types() {
        return {
            requestId: 'string',
            icTotalConfSigDatas: { 'type': 'array', 'itemType': DescribeAfsTotalConfDataResponseBodyIcTotalConfSigDatas },
            nvcTotalConfSecVerifyDatas: { 'type': 'array', 'itemType': DescribeAfsTotalConfDataResponseBodyNvcTotalConfSecVerifyDatas },
            icTotalConfVerifyDatas: { 'type': 'array', 'itemType': DescribeAfsTotalConfDataResponseBodyIcTotalConfVerifyDatas },
            nvcTotalConfVerifyDatas: { 'type': 'array', 'itemType': DescribeAfsTotalConfDataResponseBodyNvcTotalConfVerifyDatas },
            icTotalConfSecVerifyDatas: { 'type': 'array', 'itemType': DescribeAfsTotalConfDataResponseBodyIcTotalConfSecVerifyDatas },
            ncTotalConfBlockDatas: { 'type': 'array', 'itemType': DescribeAfsTotalConfDataResponseBodyNcTotalConfBlockDatas },
            icTotalConfBlockDatas: { 'type': 'array', 'itemType': DescribeAfsTotalConfDataResponseBodyIcTotalConfBlockDatas },
            ncTotalConfSigDatas: { 'type': 'array', 'itemType': DescribeAfsTotalConfDataResponseBodyNcTotalConfSigDatas },
            bizCode: 'string',
            hasData: 'boolean',
            ncTotalConfVerifyDatas: { 'type': 'array', 'itemType': DescribeAfsTotalConfDataResponseBodyNcTotalConfVerifyDatas },
        };
    }
}
exports.DescribeAfsTotalConfDataResponseBody = DescribeAfsTotalConfDataResponseBody;
class DescribeAfsTotalConfDataResponse extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            headers: 'headers',
            body: 'body',
        };
    }
    static types() {
        return {
            headers: { 'type': 'map', 'keyType': 'string', 'valueType': 'string' },
            body: DescribeAfsTotalConfDataResponseBody,
        };
    }
}
exports.DescribeAfsTotalConfDataResponse = DescribeAfsTotalConfDataResponse;
class DescribeAfsVerifySigDataRequest extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            sourceIp: 'SourceIp',
            appKey: 'AppKey',
            scene: 'Scene',
            productName: 'ProductName',
        };
    }
    static types() {
        return {
            sourceIp: 'string',
            appKey: 'string',
            scene: 'string',
            productName: 'string',
        };
    }
}
exports.DescribeAfsVerifySigDataRequest = DescribeAfsVerifySigDataRequest;
class DescribeAfsVerifySigDataResponseBody extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            nvcCodeDatas: 'NvcCodeDatas',
            nvcSecDatas: 'NvcSecDatas',
            icVerifyDatas: 'IcVerifyDatas',
            requestId: 'RequestId',
            ncVerifyDatas: 'NcVerifyDatas',
            nvcVerifyDatas: 'NvcVerifyDatas',
            icSecVerifyDatas: 'IcSecVerifyDatas',
            ncSigDatas: 'NcSigDatas',
            bizCode: 'BizCode',
            hasData: 'HasData',
        };
    }
    static types() {
        return {
            nvcCodeDatas: { 'type': 'array', 'itemType': DescribeAfsVerifySigDataResponseBodyNvcCodeDatas },
            nvcSecDatas: { 'type': 'array', 'itemType': DescribeAfsVerifySigDataResponseBodyNvcSecDatas },
            icVerifyDatas: { 'type': 'array', 'itemType': DescribeAfsVerifySigDataResponseBodyIcVerifyDatas },
            requestId: 'string',
            ncVerifyDatas: { 'type': 'array', 'itemType': DescribeAfsVerifySigDataResponseBodyNcVerifyDatas },
            nvcVerifyDatas: { 'type': 'array', 'itemType': DescribeAfsVerifySigDataResponseBodyNvcVerifyDatas },
            icSecVerifyDatas: { 'type': 'array', 'itemType': DescribeAfsVerifySigDataResponseBodyIcSecVerifyDatas },
            ncSigDatas: { 'type': 'array', 'itemType': DescribeAfsVerifySigDataResponseBodyNcSigDatas },
            bizCode: 'string',
            hasData: 'boolean',
        };
    }
}
exports.DescribeAfsVerifySigDataResponseBody = DescribeAfsVerifySigDataResponseBody;
class DescribeAfsVerifySigDataResponse extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            headers: 'headers',
            body: 'body',
        };
    }
    static types() {
        return {
            headers: { 'type': 'map', 'keyType': 'string', 'valueType': 'string' },
            body: DescribeAfsVerifySigDataResponseBody,
        };
    }
}
exports.DescribeAfsVerifySigDataResponse = DescribeAfsVerifySigDataResponse;
class DescribeCaptchaDayRequest extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            sourceIp: 'SourceIp',
            configName: 'ConfigName',
            type: 'Type',
            time: 'Time',
            refExtId: 'RefExtId',
        };
    }
    static types() {
        return {
            sourceIp: 'string',
            configName: 'string',
            type: 'string',
            time: 'string',
            refExtId: 'string',
        };
    }
}
exports.DescribeCaptchaDayRequest = DescribeCaptchaDayRequest;
class DescribeCaptchaDayResponseBody extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            captchaDay: 'CaptchaDay',
            requestId: 'RequestId',
            bizCode: 'BizCode',
            hasData: 'HasData',
        };
    }
    static types() {
        return {
            captchaDay: DescribeCaptchaDayResponseBodyCaptchaDay,
            requestId: 'string',
            bizCode: 'string',
            hasData: 'boolean',
        };
    }
}
exports.DescribeCaptchaDayResponseBody = DescribeCaptchaDayResponseBody;
class DescribeCaptchaDayResponse extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            headers: 'headers',
            body: 'body',
        };
    }
    static types() {
        return {
            headers: { 'type': 'map', 'keyType': 'string', 'valueType': 'string' },
            body: DescribeCaptchaDayResponseBody,
        };
    }
}
exports.DescribeCaptchaDayResponse = DescribeCaptchaDayResponse;
class DescribeCaptchaIpCityRequest extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            sourceIp: 'SourceIp',
            configName: 'ConfigName',
            type: 'Type',
            time: 'Time',
            refExtId: 'RefExtId',
        };
    }
    static types() {
        return {
            sourceIp: 'string',
            configName: 'string',
            type: 'string',
            time: 'string',
            refExtId: 'string',
        };
    }
}
exports.DescribeCaptchaIpCityRequest = DescribeCaptchaIpCityRequest;
class DescribeCaptchaIpCityResponseBody extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            captchaIps: 'CaptchaIps',
            captchaCities: 'CaptchaCities',
            requestId: 'RequestId',
            bizCode: 'BizCode',
            hasData: 'HasData',
        };
    }
    static types() {
        return {
            captchaIps: { 'type': 'array', 'itemType': DescribeCaptchaIpCityResponseBodyCaptchaIps },
            captchaCities: { 'type': 'array', 'itemType': DescribeCaptchaIpCityResponseBodyCaptchaCities },
            requestId: 'string',
            bizCode: 'string',
            hasData: 'boolean',
        };
    }
}
exports.DescribeCaptchaIpCityResponseBody = DescribeCaptchaIpCityResponseBody;
class DescribeCaptchaIpCityResponse extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            headers: 'headers',
            body: 'body',
        };
    }
    static types() {
        return {
            headers: { 'type': 'map', 'keyType': 'string', 'valueType': 'string' },
            body: DescribeCaptchaIpCityResponseBody,
        };
    }
}
exports.DescribeCaptchaIpCityResponse = DescribeCaptchaIpCityResponse;
class DescribeCaptchaMinRequest extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            sourceIp: 'SourceIp',
            configName: 'ConfigName',
            type: 'Type',
            time: 'Time',
            refExtId: 'RefExtId',
        };
    }
    static types() {
        return {
            sourceIp: 'string',
            configName: 'string',
            type: 'string',
            time: 'string',
            refExtId: 'string',
        };
    }
}
exports.DescribeCaptchaMinRequest = DescribeCaptchaMinRequest;
class DescribeCaptchaMinResponseBody extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            requestId: 'RequestId',
            captchaMins: 'CaptchaMins',
            bizCode: 'BizCode',
            hasData: 'HasData',
        };
    }
    static types() {
        return {
            requestId: 'string',
            captchaMins: { 'type': 'array', 'itemType': DescribeCaptchaMinResponseBodyCaptchaMins },
            bizCode: 'string',
            hasData: 'boolean',
        };
    }
}
exports.DescribeCaptchaMinResponseBody = DescribeCaptchaMinResponseBody;
class DescribeCaptchaMinResponse extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            headers: 'headers',
            body: 'body',
        };
    }
    static types() {
        return {
            headers: { 'type': 'map', 'keyType': 'string', 'valueType': 'string' },
            body: DescribeCaptchaMinResponseBody,
        };
    }
}
exports.DescribeCaptchaMinResponse = DescribeCaptchaMinResponse;
class DescribeCaptchaOrderRequest extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            sourceIp: 'SourceIp',
            lang: 'Lang',
        };
    }
    static types() {
        return {
            sourceIp: 'string',
            lang: 'string',
        };
    }
}
exports.DescribeCaptchaOrderRequest = DescribeCaptchaOrderRequest;
class DescribeCaptchaOrderResponseBody extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            requestId: 'RequestId',
            bizCode: 'BizCode',
        };
    }
    static types() {
        return {
            requestId: 'string',
            bizCode: 'string',
        };
    }
}
exports.DescribeCaptchaOrderResponseBody = DescribeCaptchaOrderResponseBody;
class DescribeCaptchaOrderResponse extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            headers: 'headers',
            body: 'body',
        };
    }
    static types() {
        return {
            headers: { 'type': 'map', 'keyType': 'string', 'valueType': 'string' },
            body: DescribeCaptchaOrderResponseBody,
        };
    }
}
exports.DescribeCaptchaOrderResponse = DescribeCaptchaOrderResponse;
class DescribeCaptchaRiskRequest extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            sourceIp: 'SourceIp',
            configName: 'ConfigName',
            time: 'Time',
            refExtId: 'RefExtId',
        };
    }
    static types() {
        return {
            sourceIp: 'string',
            configName: 'string',
            time: 'string',
            refExtId: 'string',
        };
    }
}
exports.DescribeCaptchaRiskRequest = DescribeCaptchaRiskRequest;
class DescribeCaptchaRiskResponseBody extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            requestId: 'RequestId',
            numOfLastMonth: 'NumOfLastMonth',
            riskLevel: 'RiskLevel',
            numOfThisMonth: 'NumOfThisMonth',
            bizCode: 'BizCode',
        };
    }
    static types() {
        return {
            requestId: 'string',
            numOfLastMonth: 'number',
            riskLevel: 'string',
            numOfThisMonth: 'number',
            bizCode: 'string',
        };
    }
}
exports.DescribeCaptchaRiskResponseBody = DescribeCaptchaRiskResponseBody;
class DescribeCaptchaRiskResponse extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            headers: 'headers',
            body: 'body',
        };
    }
    static types() {
        return {
            headers: { 'type': 'map', 'keyType': 'string', 'valueType': 'string' },
            body: DescribeCaptchaRiskResponseBody,
        };
    }
}
exports.DescribeCaptchaRiskResponse = DescribeCaptchaRiskResponse;
class DescribeConfigNameRequest extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            sourceIp: 'SourceIp',
        };
    }
    static types() {
        return {
            sourceIp: 'string',
        };
    }
}
exports.DescribeConfigNameRequest = DescribeConfigNameRequest;
class DescribeConfigNameResponseBody extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            requestId: 'RequestId',
            configNames: 'ConfigNames',
            hasConfig: 'HasConfig',
            bizCode: 'BizCode',
        };
    }
    static types() {
        return {
            requestId: 'string',
            configNames: { 'type': 'array', 'itemType': DescribeConfigNameResponseBodyConfigNames },
            hasConfig: 'boolean',
            bizCode: 'string',
        };
    }
}
exports.DescribeConfigNameResponseBody = DescribeConfigNameResponseBody;
class DescribeConfigNameResponse extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            headers: 'headers',
            body: 'body',
        };
    }
    static types() {
        return {
            headers: { 'type': 'map', 'keyType': 'string', 'valueType': 'string' },
            body: DescribeConfigNameResponseBody,
        };
    }
}
exports.DescribeConfigNameResponse = DescribeConfigNameResponse;
class DescribeEarlyWarningRequest extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            sourceIp: 'SourceIp',
        };
    }
    static types() {
        return {
            sourceIp: 'string',
        };
    }
}
exports.DescribeEarlyWarningRequest = DescribeEarlyWarningRequest;
class DescribeEarlyWarningResponseBody extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            requestId: 'RequestId',
            hasWarning: 'HasWarning',
            earlyWarnings: 'EarlyWarnings',
            bizCode: 'BizCode',
        };
    }
    static types() {
        return {
            requestId: 'string',
            hasWarning: 'boolean',
            earlyWarnings: { 'type': 'array', 'itemType': DescribeEarlyWarningResponseBodyEarlyWarnings },
            bizCode: 'string',
        };
    }
}
exports.DescribeEarlyWarningResponseBody = DescribeEarlyWarningResponseBody;
class DescribeEarlyWarningResponse extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            headers: 'headers',
            body: 'body',
        };
    }
    static types() {
        return {
            headers: { 'type': 'map', 'keyType': 'string', 'valueType': 'string' },
            body: DescribeEarlyWarningResponseBody,
        };
    }
}
exports.DescribeEarlyWarningResponse = DescribeEarlyWarningResponse;
class DescribeOrderInfoRequest extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            sourceIp: 'SourceIp',
        };
    }
    static types() {
        return {
            sourceIp: 'string',
        };
    }
}
exports.DescribeOrderInfoRequest = DescribeOrderInfoRequest;
class DescribeOrderInfoResponseBody extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            orderLevel: 'OrderLevel',
            requestId: 'RequestId',
            num: 'Num',
            endDate: 'EndDate',
            bizCode: 'BizCode',
            beginDate: 'BeginDate',
        };
    }
    static types() {
        return {
            orderLevel: 'string',
            requestId: 'string',
            num: 'string',
            endDate: 'string',
            bizCode: 'string',
            beginDate: 'string',
        };
    }
}
exports.DescribeOrderInfoResponseBody = DescribeOrderInfoResponseBody;
class DescribeOrderInfoResponse extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            headers: 'headers',
            body: 'body',
        };
    }
    static types() {
        return {
            headers: { 'type': 'map', 'keyType': 'string', 'valueType': 'string' },
            body: DescribeOrderInfoResponseBody,
        };
    }
}
exports.DescribeOrderInfoResponse = DescribeOrderInfoResponse;
class DescribePersonMachineListRequest extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            sourceIp: 'SourceIp',
        };
    }
    static types() {
        return {
            sourceIp: 'string',
        };
    }
}
exports.DescribePersonMachineListRequest = DescribePersonMachineListRequest;
class DescribePersonMachineListResponseBody extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            personMachineRes: 'PersonMachineRes',
            requestId: 'RequestId',
            bizCode: 'BizCode',
        };
    }
    static types() {
        return {
            personMachineRes: DescribePersonMachineListResponseBodyPersonMachineRes,
            requestId: 'string',
            bizCode: 'string',
        };
    }
}
exports.DescribePersonMachineListResponseBody = DescribePersonMachineListResponseBody;
class DescribePersonMachineListResponse extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            headers: 'headers',
            body: 'body',
        };
    }
    static types() {
        return {
            headers: { 'type': 'map', 'keyType': 'string', 'valueType': 'string' },
            body: DescribePersonMachineListResponseBody,
        };
    }
}
exports.DescribePersonMachineListResponse = DescribePersonMachineListResponse;
class SetEarlyWarningRequest extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            sourceIp: 'SourceIp',
            warnOpen: 'WarnOpen',
            channel: 'Channel',
            frequency: 'Frequency',
            timeOpen: 'TimeOpen',
            timeBegin: 'TimeBegin',
            timeEnd: 'TimeEnd',
            title: 'Title',
        };
    }
    static types() {
        return {
            sourceIp: 'string',
            warnOpen: 'boolean',
            channel: 'string',
            frequency: 'string',
            timeOpen: 'boolean',
            timeBegin: 'string',
            timeEnd: 'string',
            title: 'string',
        };
    }
}
exports.SetEarlyWarningRequest = SetEarlyWarningRequest;
class SetEarlyWarningResponseBody extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            requestId: 'RequestId',
            bizCode: 'BizCode',
        };
    }
    static types() {
        return {
            requestId: 'string',
            bizCode: 'string',
        };
    }
}
exports.SetEarlyWarningResponseBody = SetEarlyWarningResponseBody;
class SetEarlyWarningResponse extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            headers: 'headers',
            body: 'body',
        };
    }
    static types() {
        return {
            headers: { 'type': 'map', 'keyType': 'string', 'valueType': 'string' },
            body: SetEarlyWarningResponseBody,
        };
    }
}
exports.SetEarlyWarningResponse = SetEarlyWarningResponse;
class UpdateConfigNameRequest extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            sourceIp: 'SourceIp',
            lang: 'Lang',
            refExtId: 'RefExtId',
            configName: 'ConfigName',
        };
    }
    static types() {
        return {
            sourceIp: 'string',
            lang: 'string',
            refExtId: 'string',
            configName: 'string',
        };
    }
}
exports.UpdateConfigNameRequest = UpdateConfigNameRequest;
class UpdateConfigNameResponseBody extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            requestId: 'RequestId',
            bizCode: 'BizCode',
        };
    }
    static types() {
        return {
            requestId: 'string',
            bizCode: 'string',
        };
    }
}
exports.UpdateConfigNameResponseBody = UpdateConfigNameResponseBody;
class UpdateConfigNameResponse extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            headers: 'headers',
            body: 'body',
        };
    }
    static types() {
        return {
            headers: { 'type': 'map', 'keyType': 'string', 'valueType': 'string' },
            body: UpdateConfigNameResponseBody,
        };
    }
}
exports.UpdateConfigNameResponse = UpdateConfigNameResponse;
class ConfigurationStyleResponseBodyCodeData extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            nodeJs: 'NodeJs',
            javaUrl: 'JavaUrl',
            python: 'Python',
            java: 'Java',
            nodeJsUrl: 'NodeJsUrl',
            pythonUrl: 'PythonUrl',
            html: 'Html',
            phpUrl: 'PhpUrl',
            netUrl: 'NetUrl',
            php: 'Php',
            net: 'Net',
        };
    }
    static types() {
        return {
            nodeJs: 'string',
            javaUrl: 'string',
            python: 'string',
            java: 'string',
            nodeJsUrl: 'string',
            pythonUrl: 'string',
            html: 'string',
            phpUrl: 'string',
            netUrl: 'string',
            php: 'string',
            net: 'string',
        };
    }
}
exports.ConfigurationStyleResponseBodyCodeData = ConfigurationStyleResponseBodyCodeData;
class DescribeAfsConfigNameResponseBodyConfigNames extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            configName: 'ConfigName',
            appKey: 'AppKey',
            refExtId: 'RefExtId',
            aliUid: 'AliUid',
            scene: 'Scene',
        };
    }
    static types() {
        return {
            configName: 'string',
            appKey: 'string',
            refExtId: 'string',
            aliUid: 'string',
            scene: 'string',
        };
    }
}
exports.DescribeAfsConfigNameResponseBodyConfigNames = DescribeAfsConfigNameResponseBodyConfigNames;
class DescribeAfsOneConfDataResponseBodyIcOneConfDatas extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            icSigCnt: 'IcSigCnt',
            icBlockCnt: 'IcBlockCnt',
            tableDate: 'TableDate',
            icVerifyCnt: 'IcVerifyCnt',
            icSecVerifyCnt: 'IcSecVerifyCnt',
            icInitCnt: 'IcInitCnt',
            icNoActionCnt: 'IcNoActionCnt',
        };
    }
    static types() {
        return {
            icSigCnt: 'number',
            icBlockCnt: 'number',
            tableDate: 'string',
            icVerifyCnt: 'number',
            icSecVerifyCnt: 'number',
            icInitCnt: 'number',
            icNoActionCnt: 'number',
        };
    }
}
exports.DescribeAfsOneConfDataResponseBodyIcOneConfDatas = DescribeAfsOneConfDataResponseBodyIcOneConfDatas;
class DescribeAfsOneConfDataResponseBodyNcOneConfDatas extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            tableDate: 'TableDate',
            ncSigCnt: 'NcSigCnt',
            ncVerifyCnt: 'NcVerifyCnt',
            ncNoActionCnt: 'NcNoActionCnt',
            ncVerifyBlockCnt: 'NcVerifyBlockCnt',
            ncInitCnt: 'NcInitCnt',
            ncSigBlockCnt: 'NcSigBlockCnt',
        };
    }
    static types() {
        return {
            tableDate: 'string',
            ncSigCnt: 'number',
            ncVerifyCnt: 'number',
            ncNoActionCnt: 'number',
            ncVerifyBlockCnt: 'number',
            ncInitCnt: 'number',
            ncSigBlockCnt: 'number',
        };
    }
}
exports.DescribeAfsOneConfDataResponseBodyNcOneConfDatas = DescribeAfsOneConfDataResponseBodyNcOneConfDatas;
class DescribeAfsOneConfDataResponseBodyNvcOneConfDatas extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            nvcNoActionCnt: 'NvcNoActionCnt',
            nvcSecVerifyCnt: 'NvcSecVerifyCnt',
            tableDate: 'TableDate',
            nvcVerifyCnt: 'NvcVerifyCnt',
            nvcBlockCnt: 'NvcBlockCnt',
            nvcInitCnt: 'NvcInitCnt',
        };
    }
    static types() {
        return {
            nvcNoActionCnt: 'number',
            nvcSecVerifyCnt: 'number',
            tableDate: 'string',
            nvcVerifyCnt: 'number',
            nvcBlockCnt: 'number',
            nvcInitCnt: 'number',
        };
    }
}
exports.DescribeAfsOneConfDataResponseBodyNvcOneConfDatas = DescribeAfsOneConfDataResponseBodyNvcOneConfDatas;
class DescribeAfsTotalConfDataResponseBodyIcTotalConfSigDatas extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            time: 'Time',
            value: 'Value',
            category: 'Category',
        };
    }
    static types() {
        return {
            time: 'string',
            value: 'number',
            category: 'string',
        };
    }
}
exports.DescribeAfsTotalConfDataResponseBodyIcTotalConfSigDatas = DescribeAfsTotalConfDataResponseBodyIcTotalConfSigDatas;
class DescribeAfsTotalConfDataResponseBodyNvcTotalConfSecVerifyDatas extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            time: 'Time',
            value: 'Value',
            category: 'Category',
        };
    }
    static types() {
        return {
            time: 'string',
            value: 'number',
            category: 'string',
        };
    }
}
exports.DescribeAfsTotalConfDataResponseBodyNvcTotalConfSecVerifyDatas = DescribeAfsTotalConfDataResponseBodyNvcTotalConfSecVerifyDatas;
class DescribeAfsTotalConfDataResponseBodyIcTotalConfVerifyDatas extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            time: 'Time',
            value: 'Value',
            category: 'Category',
        };
    }
    static types() {
        return {
            time: 'string',
            value: 'number',
            category: 'string',
        };
    }
}
exports.DescribeAfsTotalConfDataResponseBodyIcTotalConfVerifyDatas = DescribeAfsTotalConfDataResponseBodyIcTotalConfVerifyDatas;
class DescribeAfsTotalConfDataResponseBodyNvcTotalConfVerifyDatas extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            time: 'Time',
            value: 'Value',
            category: 'Category',
        };
    }
    static types() {
        return {
            time: 'string',
            value: 'number',
            category: 'string',
        };
    }
}
exports.DescribeAfsTotalConfDataResponseBodyNvcTotalConfVerifyDatas = DescribeAfsTotalConfDataResponseBodyNvcTotalConfVerifyDatas;
class DescribeAfsTotalConfDataResponseBodyIcTotalConfSecVerifyDatas extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            time: 'Time',
            value: 'Value',
            category: 'Category',
        };
    }
    static types() {
        return {
            time: 'string',
            value: 'number',
            category: 'string',
        };
    }
}
exports.DescribeAfsTotalConfDataResponseBodyIcTotalConfSecVerifyDatas = DescribeAfsTotalConfDataResponseBodyIcTotalConfSecVerifyDatas;
class DescribeAfsTotalConfDataResponseBodyNcTotalConfBlockDatas extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            time: 'Time',
            value: 'Value',
            category: 'Category',
        };
    }
    static types() {
        return {
            time: 'string',
            value: 'number',
            category: 'string',
        };
    }
}
exports.DescribeAfsTotalConfDataResponseBodyNcTotalConfBlockDatas = DescribeAfsTotalConfDataResponseBodyNcTotalConfBlockDatas;
class DescribeAfsTotalConfDataResponseBodyIcTotalConfBlockDatas extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            time: 'Time',
            value: 'Value',
            category: 'Category',
        };
    }
    static types() {
        return {
            time: 'string',
            value: 'number',
            category: 'string',
        };
    }
}
exports.DescribeAfsTotalConfDataResponseBodyIcTotalConfBlockDatas = DescribeAfsTotalConfDataResponseBodyIcTotalConfBlockDatas;
class DescribeAfsTotalConfDataResponseBodyNcTotalConfSigDatas extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            time: 'Time',
            value: 'Value',
            category: 'Category',
        };
    }
    static types() {
        return {
            time: 'string',
            value: 'number',
            category: 'string',
        };
    }
}
exports.DescribeAfsTotalConfDataResponseBodyNcTotalConfSigDatas = DescribeAfsTotalConfDataResponseBodyNcTotalConfSigDatas;
class DescribeAfsTotalConfDataResponseBodyNcTotalConfVerifyDatas extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            time: 'Time',
            value: 'Value',
            category: 'Category',
        };
    }
    static types() {
        return {
            time: 'string',
            value: 'number',
            category: 'string',
        };
    }
}
exports.DescribeAfsTotalConfDataResponseBodyNcTotalConfVerifyDatas = DescribeAfsTotalConfDataResponseBodyNcTotalConfVerifyDatas;
class DescribeAfsVerifySigDataResponseBodyNvcCodeDatas extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            time: 'Time',
            nvcCode400: 'NvcCode400',
            nvcCode200: 'NvcCode200',
            nvcCode800: 'NvcCode800',
            nvcCode600: 'NvcCode600',
        };
    }
    static types() {
        return {
            time: 'string',
            nvcCode400: 'number',
            nvcCode200: 'number',
            nvcCode800: 'number',
            nvcCode600: 'number',
        };
    }
}
exports.DescribeAfsVerifySigDataResponseBodyNvcCodeDatas = DescribeAfsVerifySigDataResponseBodyNvcCodeDatas;
class DescribeAfsVerifySigDataResponseBodyNvcSecDatas extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            time: 'Time',
            nvcSecBlock: 'NvcSecBlock',
            nvcSecPass: 'NvcSecPass',
        };
    }
    static types() {
        return {
            time: 'string',
            nvcSecBlock: 'number',
            nvcSecPass: 'number',
        };
    }
}
exports.DescribeAfsVerifySigDataResponseBodyNvcSecDatas = DescribeAfsVerifySigDataResponseBodyNvcSecDatas;
class DescribeAfsVerifySigDataResponseBodyIcVerifyDatas extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            icSigCnt: 'IcSigCnt',
            time: 'Time',
            icBlockCnt: 'IcBlockCnt',
            icSecVerifyCnt: 'IcSecVerifyCnt',
            icVerifyCnt: 'IcVerifyCnt',
        };
    }
    static types() {
        return {
            icSigCnt: 'number',
            time: 'string',
            icBlockCnt: 'number',
            icSecVerifyCnt: 'number',
            icVerifyCnt: 'number',
        };
    }
}
exports.DescribeAfsVerifySigDataResponseBodyIcVerifyDatas = DescribeAfsVerifySigDataResponseBodyIcVerifyDatas;
class DescribeAfsVerifySigDataResponseBodyNcVerifyDatas extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            time: 'Time',
            ncVerifyPass: 'NcVerifyPass',
            ncVerifyBlock: 'NcVerifyBlock',
        };
    }
    static types() {
        return {
            time: 'string',
            ncVerifyPass: 'number',
            ncVerifyBlock: 'number',
        };
    }
}
exports.DescribeAfsVerifySigDataResponseBodyNcVerifyDatas = DescribeAfsVerifySigDataResponseBodyNcVerifyDatas;
class DescribeAfsVerifySigDataResponseBodyNvcVerifyDatas extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            time: 'Time',
            nvcSecVerifyCnt: 'NvcSecVerifyCnt',
            nvcVerifyCnt: 'NvcVerifyCnt',
        };
    }
    static types() {
        return {
            time: 'string',
            nvcSecVerifyCnt: 'number',
            nvcVerifyCnt: 'number',
        };
    }
}
exports.DescribeAfsVerifySigDataResponseBodyNvcVerifyDatas = DescribeAfsVerifySigDataResponseBodyNvcVerifyDatas;
class DescribeAfsVerifySigDataResponseBodyIcSecVerifyDatas extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            icSecBlock: 'IcSecBlock',
            time: 'Time',
            icSecPass: 'IcSecPass',
        };
    }
    static types() {
        return {
            icSecBlock: 'number',
            time: 'string',
            icSecPass: 'number',
        };
    }
}
exports.DescribeAfsVerifySigDataResponseBodyIcSecVerifyDatas = DescribeAfsVerifySigDataResponseBodyIcSecVerifyDatas;
class DescribeAfsVerifySigDataResponseBodyNcSigDatas extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            time: 'Time',
            ncSigBlock: 'NcSigBlock',
            ncSigPass: 'NcSigPass',
        };
    }
    static types() {
        return {
            time: 'string',
            ncSigBlock: 'number',
            ncSigPass: 'number',
        };
    }
}
exports.DescribeAfsVerifySigDataResponseBodyNcSigDatas = DescribeAfsVerifySigDataResponseBodyNcSigDatas;
class DescribeCaptchaDayResponseBodyCaptchaDay extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            checkTested: 'CheckTested',
            direcetStrategyInterception: 'DirecetStrategyInterception',
            maliciousFlow: 'MaliciousFlow',
            pass: 'Pass',
            legalSign: 'LegalSign',
            uncheckTested: 'UncheckTested',
            askForVerify: 'AskForVerify',
            init: 'Init',
            twiceVerify: 'TwiceVerify',
        };
    }
    static types() {
        return {
            checkTested: 'number',
            direcetStrategyInterception: 'number',
            maliciousFlow: 'number',
            pass: 'number',
            legalSign: 'number',
            uncheckTested: 'number',
            askForVerify: 'number',
            init: 'number',
            twiceVerify: 'number',
        };
    }
}
exports.DescribeCaptchaDayResponseBodyCaptchaDay = DescribeCaptchaDayResponseBodyCaptchaDay;
class DescribeCaptchaIpCityResponseBodyCaptchaIps extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            value: 'Value',
            ip: 'Ip',
        };
    }
    static types() {
        return {
            value: 'number',
            ip: 'string',
        };
    }
}
exports.DescribeCaptchaIpCityResponseBodyCaptchaIps = DescribeCaptchaIpCityResponseBodyCaptchaIps;
class DescribeCaptchaIpCityResponseBodyCaptchaCities extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            pv: 'Pv',
            lng: 'Lng',
            lat: 'Lat',
            location: 'Location',
        };
    }
    static types() {
        return {
            pv: 'number',
            lng: 'string',
            lat: 'string',
            location: 'string',
        };
    }
}
exports.DescribeCaptchaIpCityResponseBodyCaptchaCities = DescribeCaptchaIpCityResponseBodyCaptchaCities;
class DescribeCaptchaMinResponseBodyCaptchaMins extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            time: 'Time',
            pass: 'Pass',
            interception: 'Interception',
        };
    }
    static types() {
        return {
            time: 'string',
            pass: 'string',
            interception: 'string',
        };
    }
}
exports.DescribeCaptchaMinResponseBodyCaptchaMins = DescribeCaptchaMinResponseBodyCaptchaMins;
class DescribeConfigNameResponseBodyConfigNames extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            configName: 'ConfigName',
            refExtId: 'RefExtId',
            aliUid: 'AliUid',
        };
    }
    static types() {
        return {
            configName: 'string',
            refExtId: 'string',
            aliUid: 'string',
        };
    }
}
exports.DescribeConfigNameResponseBodyConfigNames = DescribeConfigNameResponseBodyConfigNames;
class DescribeEarlyWarningResponseBodyEarlyWarnings extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            frequency: 'Frequency',
            timeBegin: 'TimeBegin',
            timeEnd: 'TimeEnd',
            channel: 'Channel',
            warnOpen: 'WarnOpen',
            title: 'Title',
            content: 'Content',
            timeOpen: 'TimeOpen',
        };
    }
    static types() {
        return {
            frequency: 'string',
            timeBegin: 'string',
            timeEnd: 'string',
            channel: 'string',
            warnOpen: 'boolean',
            title: 'string',
            content: 'string',
            timeOpen: 'boolean',
        };
    }
}
exports.DescribeEarlyWarningResponseBodyEarlyWarnings = DescribeEarlyWarningResponseBodyEarlyWarnings;
class DescribePersonMachineListResponseBodyPersonMachineResPersonMachines extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            configurationName: 'ConfigurationName',
            configurationMethod: 'ConfigurationMethod',
            extId: 'ExtId',
            applyType: 'ApplyType',
            lastUpdate: 'LastUpdate',
            scene: 'Scene',
            sceneOriginal: 'SceneOriginal',
            appkey: 'Appkey',
        };
    }
    static types() {
        return {
            configurationName: 'string',
            configurationMethod: 'string',
            extId: 'string',
            applyType: 'string',
            lastUpdate: 'string',
            scene: 'string',
            sceneOriginal: 'string',
            appkey: 'string',
        };
    }
}
exports.DescribePersonMachineListResponseBodyPersonMachineResPersonMachines = DescribePersonMachineListResponseBodyPersonMachineResPersonMachines;
class DescribePersonMachineListResponseBodyPersonMachineRes extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            personMachines: 'PersonMachines',
            hasConfiguration: 'HasConfiguration',
        };
    }
    static types() {
        return {
            personMachines: { 'type': 'array', 'itemType': DescribePersonMachineListResponseBodyPersonMachineResPersonMachines },
            hasConfiguration: 'string',
        };
    }
}
exports.DescribePersonMachineListResponseBodyPersonMachineRes = DescribePersonMachineListResponseBodyPersonMachineRes;
class Client extends openapi_client_1.default {
    constructor(config) {
        super(config);
        this._endpointRule = "regional";
        this._endpointMap = {
            'ap-northeast-1': "afs.aliyuncs.com",
            'ap-northeast-2-pop': "afs.aliyuncs.com",
            'ap-south-1': "afs.aliyuncs.com",
            'ap-southeast-1': "afs.aliyuncs.com",
            'ap-southeast-2': "afs.aliyuncs.com",
            'ap-southeast-3': "afs.aliyuncs.com",
            'ap-southeast-5': "afs.aliyuncs.com",
            'cn-beijing': "afs.aliyuncs.com",
            'cn-beijing-finance-1': "afs.aliyuncs.com",
            'cn-beijing-finance-pop': "afs.aliyuncs.com",
            'cn-beijing-gov-1': "afs.aliyuncs.com",
            'cn-beijing-nu16-b01': "afs.aliyuncs.com",
            'cn-chengdu': "afs.aliyuncs.com",
            'cn-edge-1': "afs.aliyuncs.com",
            'cn-fujian': "afs.aliyuncs.com",
            'cn-haidian-cm12-c01': "afs.aliyuncs.com",
            'cn-hangzhou-bj-b01': "afs.aliyuncs.com",
            'cn-hangzhou-finance': "afs.aliyuncs.com",
            'cn-hangzhou-internal-prod-1': "afs.aliyuncs.com",
            'cn-hangzhou-internal-test-1': "afs.aliyuncs.com",
            'cn-hangzhou-internal-test-2': "afs.aliyuncs.com",
            'cn-hangzhou-internal-test-3': "afs.aliyuncs.com",
            'cn-hangzhou-test-306': "afs.aliyuncs.com",
            'cn-hongkong': "afs.aliyuncs.com",
            'cn-hongkong-finance-pop': "afs.aliyuncs.com",
            'cn-huhehaote': "afs.aliyuncs.com",
            'cn-north-2-gov-1': "afs.aliyuncs.com",
            'cn-qingdao': "afs.aliyuncs.com",
            'cn-qingdao-nebula': "afs.aliyuncs.com",
            'cn-shanghai': "afs.aliyuncs.com",
            'cn-shanghai-et15-b01': "afs.aliyuncs.com",
            'cn-shanghai-et2-b01': "afs.aliyuncs.com",
            'cn-shanghai-finance-1': "afs.aliyuncs.com",
            'cn-shanghai-inner': "afs.aliyuncs.com",
            'cn-shanghai-internal-test-1': "afs.aliyuncs.com",
            'cn-shenzhen': "afs.aliyuncs.com",
            'cn-shenzhen-finance-1': "afs.aliyuncs.com",
            'cn-shenzhen-inner': "afs.aliyuncs.com",
            'cn-shenzhen-st4-d01': "afs.aliyuncs.com",
            'cn-shenzhen-su18-b01': "afs.aliyuncs.com",
            'cn-wuhan': "afs.aliyuncs.com",
            'cn-yushanfang': "afs.aliyuncs.com",
            'cn-zhangbei-na61-b01': "afs.aliyuncs.com",
            'cn-zhangjiakou': "afs.aliyuncs.com",
            'cn-zhangjiakou-na62-a01': "afs.aliyuncs.com",
            'cn-zhengzhou-nebula-1': "afs.aliyuncs.com",
            'eu-central-1': "afs.aliyuncs.com",
            'eu-west-1': "afs.aliyuncs.com",
            'eu-west-1-oxs': "afs.aliyuncs.com",
            'me-east-1': "afs.aliyuncs.com",
            'rus-west-1-pop': "afs.aliyuncs.com",
            'us-east-1': "afs.aliyuncs.com",
            'us-west-1': "afs.aliyuncs.com",
        };
        this.checkConfig(config);
        this._endpoint = this.getEndpoint("afs", this._regionId, this._endpointRule, this._network, this._suffix, this._endpointMap, this._endpoint);
    }
    getEndpoint(productId, regionId, endpointRule, network, suffix, endpointMap, endpoint) {
        if (!tea_util_1.default.empty(endpoint)) {
            return endpoint;
        }
        if (!tea_util_1.default.isUnset(endpointMap) && !tea_util_1.default.empty(endpointMap[regionId])) {
            return endpointMap[regionId];
        }
        return endpoint_util_1.default.getEndpointRules(productId, regionId, endpointRule, network, suffix);
    }
    async analyzeNvcWithOptions(request, runtime) {
        tea_util_1.default.validateModel(request);
        let req = new $OpenApi.OpenApiRequest({
            body: tea_util_1.default.toMap(request),
        });
        return $tea.cast(await this.doRPCRequest("AnalyzeNvc", "2018-01-12", "HTTPS", "POST", "AK", "json", req, runtime), new AnalyzeNvcResponse({}));
    }
    async analyzeNvc(request) {
        let runtime = new $Util.RuntimeOptions({});
        return await this.analyzeNvcWithOptions(request, runtime);
    }
    async authenticateSigWithOptions(request, runtime) {
        tea_util_1.default.validateModel(request);
        let req = new $OpenApi.OpenApiRequest({
            body: tea_util_1.default.toMap(request),
        });
        return $tea.cast(await this.doRPCRequest("AuthenticateSig", "2018-01-12", "HTTPS", "POST", "AK", "json", req, runtime), new AuthenticateSigResponse({}));
    }
    async authenticateSig(request) {
        let runtime = new $Util.RuntimeOptions({});
        return await this.authenticateSigWithOptions(request, runtime);
    }
    async configurationStyleWithOptions(request, runtime) {
        tea_util_1.default.validateModel(request);
        let req = new $OpenApi.OpenApiRequest({
            body: tea_util_1.default.toMap(request),
        });
        return $tea.cast(await this.doRPCRequest("ConfigurationStyle", "2018-01-12", "HTTPS", "POST", "AK", "json", req, runtime), new ConfigurationStyleResponse({}));
    }
    async configurationStyle(request) {
        let runtime = new $Util.RuntimeOptions({});
        return await this.configurationStyleWithOptions(request, runtime);
    }
    async createConfigurationWithOptions(request, runtime) {
        tea_util_1.default.validateModel(request);
        let req = new $OpenApi.OpenApiRequest({
            body: tea_util_1.default.toMap(request),
        });
        return $tea.cast(await this.doRPCRequest("CreateConfiguration", "2018-01-12", "HTTPS", "POST", "AK", "json", req, runtime), new CreateConfigurationResponse({}));
    }
    async createConfiguration(request) {
        let runtime = new $Util.RuntimeOptions({});
        return await this.createConfigurationWithOptions(request, runtime);
    }
    async describeAfsConfigNameWithOptions(request, runtime) {
        tea_util_1.default.validateModel(request);
        let req = new $OpenApi.OpenApiRequest({
            body: tea_util_1.default.toMap(request),
        });
        return $tea.cast(await this.doRPCRequest("DescribeAfsConfigName", "2018-01-12", "HTTPS", "POST", "AK", "json", req, runtime), new DescribeAfsConfigNameResponse({}));
    }
    async describeAfsConfigName(request) {
        let runtime = new $Util.RuntimeOptions({});
        return await this.describeAfsConfigNameWithOptions(request, runtime);
    }
    async describeAfsOneConfDataWithOptions(request, runtime) {
        tea_util_1.default.validateModel(request);
        let req = new $OpenApi.OpenApiRequest({
            body: tea_util_1.default.toMap(request),
        });
        return $tea.cast(await this.doRPCRequest("DescribeAfsOneConfData", "2018-01-12", "HTTPS", "POST", "AK", "json", req, runtime), new DescribeAfsOneConfDataResponse({}));
    }
    async describeAfsOneConfData(request) {
        let runtime = new $Util.RuntimeOptions({});
        return await this.describeAfsOneConfDataWithOptions(request, runtime);
    }
    async describeAfsTotalConfDataWithOptions(request, runtime) {
        tea_util_1.default.validateModel(request);
        let req = new $OpenApi.OpenApiRequest({
            body: tea_util_1.default.toMap(request),
        });
        return $tea.cast(await this.doRPCRequest("DescribeAfsTotalConfData", "2018-01-12", "HTTPS", "POST", "AK", "json", req, runtime), new DescribeAfsTotalConfDataResponse({}));
    }
    async describeAfsTotalConfData(request) {
        let runtime = new $Util.RuntimeOptions({});
        return await this.describeAfsTotalConfDataWithOptions(request, runtime);
    }
    async describeAfsVerifySigDataWithOptions(request, runtime) {
        tea_util_1.default.validateModel(request);
        let req = new $OpenApi.OpenApiRequest({
            body: tea_util_1.default.toMap(request),
        });
        return $tea.cast(await this.doRPCRequest("DescribeAfsVerifySigData", "2018-01-12", "HTTPS", "POST", "AK", "json", req, runtime), new DescribeAfsVerifySigDataResponse({}));
    }
    async describeAfsVerifySigData(request) {
        let runtime = new $Util.RuntimeOptions({});
        return await this.describeAfsVerifySigDataWithOptions(request, runtime);
    }
    async describeCaptchaDayWithOptions(request, runtime) {
        tea_util_1.default.validateModel(request);
        let req = new $OpenApi.OpenApiRequest({
            body: tea_util_1.default.toMap(request),
        });
        return $tea.cast(await this.doRPCRequest("DescribeCaptchaDay", "2018-01-12", "HTTPS", "POST", "AK", "json", req, runtime), new DescribeCaptchaDayResponse({}));
    }
    async describeCaptchaDay(request) {
        let runtime = new $Util.RuntimeOptions({});
        return await this.describeCaptchaDayWithOptions(request, runtime);
    }
    async describeCaptchaIpCityWithOptions(request, runtime) {
        tea_util_1.default.validateModel(request);
        let req = new $OpenApi.OpenApiRequest({
            body: tea_util_1.default.toMap(request),
        });
        return $tea.cast(await this.doRPCRequest("DescribeCaptchaIpCity", "2018-01-12", "HTTPS", "POST", "AK", "json", req, runtime), new DescribeCaptchaIpCityResponse({}));
    }
    async describeCaptchaIpCity(request) {
        let runtime = new $Util.RuntimeOptions({});
        return await this.describeCaptchaIpCityWithOptions(request, runtime);
    }
    async describeCaptchaMinWithOptions(request, runtime) {
        tea_util_1.default.validateModel(request);
        let req = new $OpenApi.OpenApiRequest({
            body: tea_util_1.default.toMap(request),
        });
        return $tea.cast(await this.doRPCRequest("DescribeCaptchaMin", "2018-01-12", "HTTPS", "POST", "AK", "json", req, runtime), new DescribeCaptchaMinResponse({}));
    }
    async describeCaptchaMin(request) {
        let runtime = new $Util.RuntimeOptions({});
        return await this.describeCaptchaMinWithOptions(request, runtime);
    }
    async describeCaptchaOrderWithOptions(request, runtime) {
        tea_util_1.default.validateModel(request);
        let req = new $OpenApi.OpenApiRequest({
            body: tea_util_1.default.toMap(request),
        });
        return $tea.cast(await this.doRPCRequest("DescribeCaptchaOrder", "2018-01-12", "HTTPS", "POST", "AK", "json", req, runtime), new DescribeCaptchaOrderResponse({}));
    }
    async describeCaptchaOrder(request) {
        let runtime = new $Util.RuntimeOptions({});
        return await this.describeCaptchaOrderWithOptions(request, runtime);
    }
    async describeCaptchaRiskWithOptions(request, runtime) {
        tea_util_1.default.validateModel(request);
        let req = new $OpenApi.OpenApiRequest({
            body: tea_util_1.default.toMap(request),
        });
        return $tea.cast(await this.doRPCRequest("DescribeCaptchaRisk", "2018-01-12", "HTTPS", "POST", "AK", "json", req, runtime), new DescribeCaptchaRiskResponse({}));
    }
    async describeCaptchaRisk(request) {
        let runtime = new $Util.RuntimeOptions({});
        return await this.describeCaptchaRiskWithOptions(request, runtime);
    }
    async describeConfigNameWithOptions(request, runtime) {
        tea_util_1.default.validateModel(request);
        let req = new $OpenApi.OpenApiRequest({
            body: tea_util_1.default.toMap(request),
        });
        return $tea.cast(await this.doRPCRequest("DescribeConfigName", "2018-01-12", "HTTPS", "POST", "AK", "json", req, runtime), new DescribeConfigNameResponse({}));
    }
    async describeConfigName(request) {
        let runtime = new $Util.RuntimeOptions({});
        return await this.describeConfigNameWithOptions(request, runtime);
    }
    async describeEarlyWarningWithOptions(request, runtime) {
        tea_util_1.default.validateModel(request);
        let req = new $OpenApi.OpenApiRequest({
            body: tea_util_1.default.toMap(request),
        });
        return $tea.cast(await this.doRPCRequest("DescribeEarlyWarning", "2018-01-12", "HTTPS", "POST", "AK", "json", req, runtime), new DescribeEarlyWarningResponse({}));
    }
    async describeEarlyWarning(request) {
        let runtime = new $Util.RuntimeOptions({});
        return await this.describeEarlyWarningWithOptions(request, runtime);
    }
    async describeOrderInfoWithOptions(request, runtime) {
        tea_util_1.default.validateModel(request);
        let req = new $OpenApi.OpenApiRequest({
            body: tea_util_1.default.toMap(request),
        });
        return $tea.cast(await this.doRPCRequest("DescribeOrderInfo", "2018-01-12", "HTTPS", "POST", "AK", "json", req, runtime), new DescribeOrderInfoResponse({}));
    }
    async describeOrderInfo(request) {
        let runtime = new $Util.RuntimeOptions({});
        return await this.describeOrderInfoWithOptions(request, runtime);
    }
    async describePersonMachineListWithOptions(request, runtime) {
        tea_util_1.default.validateModel(request);
        let req = new $OpenApi.OpenApiRequest({
            body: tea_util_1.default.toMap(request),
        });
        return $tea.cast(await this.doRPCRequest("DescribePersonMachineList", "2018-01-12", "HTTPS", "POST", "AK", "json", req, runtime), new DescribePersonMachineListResponse({}));
    }
    async describePersonMachineList(request) {
        let runtime = new $Util.RuntimeOptions({});
        return await this.describePersonMachineListWithOptions(request, runtime);
    }
    async setEarlyWarningWithOptions(request, runtime) {
        tea_util_1.default.validateModel(request);
        let req = new $OpenApi.OpenApiRequest({
            body: tea_util_1.default.toMap(request),
        });
        return $tea.cast(await this.doRPCRequest("SetEarlyWarning", "2018-01-12", "HTTPS", "POST", "AK", "json", req, runtime), new SetEarlyWarningResponse({}));
    }
    async setEarlyWarning(request) {
        let runtime = new $Util.RuntimeOptions({});
        return await this.setEarlyWarningWithOptions(request, runtime);
    }
    async updateConfigNameWithOptions(request, runtime) {
        tea_util_1.default.validateModel(request);
        let req = new $OpenApi.OpenApiRequest({
            body: tea_util_1.default.toMap(request),
        });
        return $tea.cast(await this.doRPCRequest("UpdateConfigName", "2018-01-12", "HTTPS", "POST", "AK", "json", req, runtime), new UpdateConfigNameResponse({}));
    }
    async updateConfigName(request) {
        let runtime = new $Util.RuntimeOptions({});
        return await this.updateConfigNameWithOptions(request, runtime);
    }
}
exports.default = Client;
