/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { AzureWizardPromptStep, IAzureQuickPickItem, IAzureQuickPickOptions } from "vscode-azureextensionui";
import { ext } from "../../extensionVariables";
import { nonNullProp } from "../../utils/nonNull";
import { ITreePropertyInfo } from "./ITreeSettingInfo";
import { ITreeSettingsWizardContext } from "./ITreeSettingsWizardContext";

export class TreeSettingStep extends AzureWizardPromptStep<ITreeSettingsWizardContext> {
    public async prompt(context: ITreeSettingsWizardContext): Promise<void> {
        const info = nonNullProp(context, 'info');
        context.telemetry.properties.setting = info.setting;

        let picks: IAzureQuickPickItem<string>[] = info.settingInfo.properties.map(convertPropertyInfoToPick);
        picks = picks.sort((p1, p2) => p1.label.localeCompare(p2.label));

        let options: IAzureQuickPickOptions = {
            placeHolder: info.description,
            suppressPersistence: true
        }

        if (Array.isArray(info.currentValue)) {
            options.isPickSelected = (p: Partial<IAzureQuickPickItem<string>>) => !!p.data && info.currentValue.includes(p.data);
            const result = await ext.ui.showQuickPick(picks, { ...options, canPickMany: true });
            context.newValue = result.map(p => p.data);
        } else {
            const result = await ext.ui.showQuickPick(picks, options);
            context.newValue = result.data;
        }
        context.telemetry.properties.newValue = context.newValue.toString();
    }

    public shouldPrompt(_context: ITreeSettingsWizardContext): boolean {
        return true;
    }
}

function convertPropertyInfoToPick(info: ITreePropertyInfo<string>): IAzureQuickPickItem<string> {
    let description: string | undefined;
    let detail: string | undefined;

    if (info.exampleValue) {
        description = `e.g. "${info.exampleValue}"`;
        detail = info.description;
    } else {
        description = info.description;
    }

    return {
        label: info.property,
        description,
        detail,
        data: info.property
    };
}