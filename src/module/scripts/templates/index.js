import { MeasuredTemplatePFAdvanced } from "./measured-template-pf-advanced";
import { AbilityTemplateAdvanced } from "./ability-template";
import { MODULE_NAME } from "../../consts";
import { CircleAnywhere } from "./circles/anywhere";
import { CircleGridIntersection } from "./circles/grid";
import { CircleSelf } from "./circles/self";
import { CircleSplash } from "./circles/splash";
import { ConeSystem } from "./cones/system";
import { ConeFromTargetSquare } from "./cones/target-square";
import { ConeFromSelf } from "./cones/self";
import { LineFromSquareEdgeSelf } from "./lines/follow-mouse-around-target/from-self";
import { LineFromSquareEdgeTarget } from "./lines/follow-mouse-around-target/target-square";
import { LineFromSquareCenterSelf } from "./lines/square-start/from-self";
import { LineFromSquareCenterTarget } from "./lines/square-start/target-square";
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
                    LineFromSquareEdgeSelf,
                    LineFromSquareEdgeTarget,
                    LineFromSquareCenterSelf,
                    LineFromSquareCenterTarget,
                    // todo AbilityTemplateLineSystem
                },
                rects: {
                    RectCentered,
                    // todo AbilityTemplateRectSystem,
                }
            }
        };
    });
};
