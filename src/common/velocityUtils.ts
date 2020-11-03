import * as Velocity from 'velocityjs'
export class VelocityUtils {
    public static render(vmString: string, context?: RenderContext): string {
        return Velocity.render(vmString, context);
    }
}