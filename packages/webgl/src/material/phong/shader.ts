import { ShaderSource } from "../../common/shader/source";
import { OUTPUT_SCALE } from "../../common/shader/config";
import { frag, vert } from "../../common/shader/base";
import { pointLightDefineCodeSource, U_PointLight } from "../../light/point";

export const phongShader = ShaderSource.create(
  vert`
    precision highp float;
    precision mediump int;

    attribute vec4 a_position;
    attribute vec4 a_normal;
    uniform mat4 u_mvpMatrix;
    uniform mat4 u_normalMatrix;
    uniform mat4 u_modelMatrix;
    
    varying vec3 v_normal;
    varying vec3 v_fragPos; // 用于传递片元的世界坐标

    void main() {
      vec4 vertexPosition = u_mvpMatrix * a_position; // 顶点的世界坐标
      // 计算顶点的世界坐标并传递给片元着色器
      vec4 worldPosition = u_modelMatrix * a_position;
      v_fragPos = worldPosition.xyz;
      v_normal = normalize(vec3(u_normalMatrix * vec4(vec3(a_normal), 0.0)));
      gl_Position =  vertexPosition;
    }
  `,
  frag`
    precision highp float;
    precision mediump int;

    varying vec3 v_normal; // 从顶点着色器传来的法线
    varying vec3 v_fragPos; // 从顶点着色器传来的片元位置

    uniform vec3 u_ambientLightColor; // 环境光颜色
    uniform vec3 u_cameraPosition; // 照相机位置 用来计算高光
    
    struct Material {
      vec3 color;
      float shininess;
    };
    uniform Material u_material;
    uniform vec3 u_materialSpecular;

    ${pointLightDefineCodeSource.code}

    #define OUTPUT_SCALE ${OUTPUT_SCALE}
    float linearToSrgb(float c) { return (c <= 0.0031308) ? c * 12.92 : 1.055 * pow(c, 1.0/2.4) - 0.055; }
    vec3 linearToSrgb(vec3 c) { return vec3(linearToSrgb(c.r), linearToSrgb(c.g), linearToSrgb(c.b)); }
    void main() {
      vec3 ambient = u_ambientLightColor * vec3(u_material.color);
      vec3 norm = normalize(v_normal);
      vec3 lightDir = normalize(${U_PointLight.Position} - v_fragPos);
      float diff = max(dot(norm, lightDir), 0.0);
      vec3 diffuse = diff * ${U_PointLight.Color} * vec3(u_material.color);
      vec3 viewDir = normalize(u_cameraPosition - v_fragPos);
      vec3 reflectDir = reflect(-lightDir, norm);
      float spec = pow(max(dot(viewDir, reflectDir), 0.0), u_material.shininess);
      vec3 specular = u_materialSpecular * ${U_PointLight.Color} * spec;
      float dist = length(${U_PointLight.Position} - v_fragPos);
      float attenuation = 1.0 / (${U_PointLight.Constant} + ${U_PointLight.Linear} * dist + ${U_PointLight.Quadratic} * dist * dist);
      vec3 result = ambient + (diffuse + specular) * attenuation * ${U_PointLight.Intensity};
      gl_FragColor = vec4(linearToSrgb(result * OUTPUT_SCALE), 1.0);
    }
  `,
);
