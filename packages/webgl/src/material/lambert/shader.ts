import { ShaderSource } from "../../common/shader/source";
import { OUTPUT_SCALE } from "../../common/shader/config";
import { frag, vert } from "../../common/shader/base";
import { pointLightDefineCodeSource, U_PointLight } from "../../light/point";

export const lambertShader = ShaderSource.create(
  vert`
    precision lowp float;

    attribute vec4 a_position; // 顶点位置
    attribute vec4 a_normal; // 顶点法线
    uniform vec3 u_ambientLightColor; // 环境光颜色
    uniform mat4 u_mvpMatrix; // 模型视图投影矩阵
    uniform mat4 u_normalMatrix; // 法线矩阵
    uniform mat4 u_modelMatrix; // 模型矩阵
    

    varying vec4 v_color; // 输出颜色

    // 材质结构体
    struct Material {
      vec3 color;
      float shininess;
    };
    uniform Material u_material;

    // 点光源结构体定义代码
    // 点光源结构体实例化代码
    ${pointLightDefineCodeSource.code}

    void main() {
      vec4 color = vec4(u_material.color, 1.0);
      vec4 vertexPosition = u_mvpMatrix * a_position;
      vec4 worldPosition = u_modelMatrix * a_position;
      vec3 lightDirection = normalize(${U_PointLight.Position} - worldPosition.xyz);
      vec3 ambientColor = u_ambientLightColor * vec3(color);
      vec3 transformedNormal = normalize(vec3(u_normalMatrix * vec4(vec3(a_normal), 0.0)));
      float dist = length(${U_PointLight.Position} - worldPosition.xyz);
      float attenuation = 1.0 / (${U_PointLight.Constant} + ${U_PointLight.Linear} * dist + ${U_PointLight.Quadratic} * dist * dist);
      float dotDeg = max(dot(transformedNormal, lightDirection), 0.0);
      vec3 diffuseColor = ${U_PointLight.Color} * vec3(color) * dotDeg * attenuation * ${U_PointLight.Intensity};
      v_color = vec4(ambientColor + diffuseColor, color.a);
      gl_Position =  vertexPosition;
    }
  `,
  frag`
    precision lowp float;
    varying vec4 v_color;
    #define OUTPUT_SCALE ${OUTPUT_SCALE}
    float linearToSrgb(float c) { return (c <= 0.0031308) ? c * 12.92 : 1.055 * pow(c, 1.0/2.4) - 0.055; }
    vec3 linearToSrgb(vec3 c) { return vec3(linearToSrgb(c.r), linearToSrgb(c.g), linearToSrgb(c.b)); }
    void main() {
      gl_FragColor = vec4(linearToSrgb(v_color.rgb * OUTPUT_SCALE), v_color.a);
    }
  `,
);
