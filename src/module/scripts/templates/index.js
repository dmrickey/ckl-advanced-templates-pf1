import { MODULE_NAME } from "../../consts";
import { AbilityTemplateAdvanced } from "./ability-template";
import { CircleAnywhere } from "./circles/anywhere";
import { CircleGridIntersection } from "./circles/grid";
import { CircleSelf } from "./circles/self";
import { CircleSplash } from "./circles/splash";
import { ConeFromSelf } from "./cones/self";
import { ConeSystem } from "./cones/system";
import { ConeFromTargetSquare } from "./cones/target-square";
import { LineFromSelf } from "./lines/from-self";
import { LineSystem } from "./lines/system";
import { LineFromSquare } from "./lines/target-square";
import { MeasuredTemplatePFAdvanced } from "./measured-template-pf-advanced";
import { RectCentered } from "./rects/centered";

export const initTemplates = () => {
    CONFIG.MeasuredTemplate.objectClass = MeasuredTemplatePFAdvanced;
    pf1.canvas.MeasuredTemplatePF = MeasuredTemplatePFAdvanced;

    Hooks.once("ready", () => {
        game.modules.get(MODULE_NAME).api = {
            // base
            AbilityTemplateAdvanced,
            MeasuredTemplatePFAdvanced,

            ability: {
                circles: {
                    CircleAnywhere,
                    CircleGridIntersection,
                    CircleSelf,
                    CircleSplash,
                },
                cones: {
                    ConeFromSelf,
                    ConeFromTargetSquare,
                    ConeSystem,
                },
                lines: {
                    LineFromSelf,
                    LineFromSquare,
                    LineSystem,
                },
                rects: {
                    RectCentered,
                }
            }
        };
    });
};
