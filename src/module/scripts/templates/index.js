import { MeasuredTemplatePFAdvanced } from "./measured-template-pf-advanced";
import { AbilityTemplateAdvanced } from "./ability-template";
import { MODULE_NAME } from "../../consts";
import { AbilityTemplateCircleAnywhere } from "./circles/anywhere";
import { AbilityTemplateCircleGrid } from "./circles/grid";
import { AbilityTemplateCircleSelf } from "./circles/self";
import { AbilityTemplateCircleSplash } from "./circles/splash";
import { AbilityTemplateConeSystem } from "./cones/system";
import { AbilityTemplateConeTarget } from "./cones/target-square";
import { AbilityTemplateConeSelf } from "./cones/self";

export const initTemplates = () => {
    CONFIG.MeasuredTemplate.objectClass = MeasuredTemplatePFAdvanced;
    pf1.canvas.MeasuredTemplatePF = MeasuredTemplatePFAdvanced;

    Hooks.once("ready", () => {
        game.modules.get(MODULE_NAME).api = {
            // base
            AbilityTemplateAdvanced,
            MeasuredTemplatePFAdvanced,

            // circles
            AbilityTemplateCircleAnywhere,
            AbilityTemplateCircleGrid,
            AbilityTemplateCircleSelf,
            AbilityTemplateCircleSplash,

            // cones
            AbilityTemplateConeSelf,
            AbilityTemplateConeTarget,
            AbilityTemplateConeSystem,
        };
    });
};
