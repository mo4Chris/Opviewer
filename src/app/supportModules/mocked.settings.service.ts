import { SettingsService } from "./settings.service";
import { MockedCommonService } from "./mocked.common.service";
import { DatetimeService } from "./datetime.service";


export const MockedSettingsService = new SettingsService(new MockedCommonService);
export const MockedDatetimeService = new DatetimeService(MockedSettingsService);

