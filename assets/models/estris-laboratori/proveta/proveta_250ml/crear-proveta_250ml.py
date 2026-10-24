import bpy, math, os, bmesh
from mathutils import Vector
out = r"D:\77 - Intermunicipal\Curs 2025-2026\blender\estris-laboratori\proveta\proveta_250ml"
os.makedirs(out, exist_ok=True)
scene=bpy.data.scenes.new("Proveta graduada · 250 ml")
bpy.context.window.scene=scene
scene.unit_settings.system='METRIC'
scene.unit_settings.scale_length=1.0
model=bpy.data.collections.new("PROVETA 250 · model")
scene.collection.children.link(model)
studio=bpy.data.collections.new("ESTUDI · camera i llums")
scene.collection.children.link(studio)
def link_obj(name,data,col):
    ob=bpy.data.objects.new(name+"_Proveta250",data);col.objects.link(ob);return ob
root=link_obj("Proveta_250mL",None,model)
root["capacitat_ml"]=250
root["tipus"]="vas de precipitats"
root["escala"]="50 a 500 ml; graduacio aproximada"
root["unitats"]="metres"
def mat(name,col,rough=.35,trans=0):
    m=bpy.data.materials.new(name);m.use_nodes=True;m.diffuse_color=(*col,1)
    p=next(n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
    p.inputs['Base Color'].default_value=(*col,1)
    p.inputs['Roughness'].default_value=rough
    p.inputs['Transmission Weight'].default_value=trans
    p.inputs['IOR'].default_value=1.46
    return m
glass=mat("Vidre borosilicat · transparent",(.965,.989,.98),.055,1)
ink=mat("Escala · blau",(.002,.018,.07),.9)
next(n for n in ink.node_tree.nodes if n.type=='BSDF_PRINCIPLED').inputs['Specular IOR Level'].default_value=0
panel=mat("Zona de retolacio · esmalt mat",(.48,.51,.51),.7)
N=192
profile=[(0,.006),(.011,.006),(.013,.007),(.014,.009),(.014,.015),(.014,.05),(.014,.10),(.014,.15),(.014,.20),(.014,.223),(.0145,.23)]
for j in range(9):
    a=math.pi*j/8
    profile.append((.01375+.0009*math.cos(a),.231+.0009*math.sin(a)))
profile +=[(.0128,.229),(.0125,.223),(.0125,.20),(.0125,.15),(.0125,.10),(.0125,.05),(.0125,.015),(.012,.010),(0,.010)]
verts=[]
for r,z in profile:
    for i in range(N):
        a=2*math.pi*i/N
        da=math.atan2(math.sin(a-math.pi), math.cos(a-math.pi))
        bump=math.exp(-0.5*(da/.23)**2)
        t=max(0,min(1,(z-.215)/.016));t=t*t*(3-2*t)
        rr=r+.004*bump*t
        zz=z-.001*bump*t
        verts.append((rr*math.cos(a),rr*math.sin(a),zz))
faces=[]
for j in range(len(profile)-1):
    for i in range(N):
        k=(i+1)%N;faces.append((j*N+i,j*N+k,(j+1)*N+k,(j+1)*N+i))
mesh=bpy.data.meshes.new("Paret_fons_i_bec_integrats");mesh.from_pydata(verts,[],faces);mesh.update()
bm=bmesh.new();bm.from_mesh(mesh);bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=1e-7);bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(mesh);bm.free()
body=link_obj("Vidre_amb_bec_abocador",mesh,model);body.parent=root;body.data.materials.append(glass)
for f in mesh.polygons:f.use_smooth=True
vg=body.vertex_groups.new(name="Bec_abocador")
vg.add([v.index for v in mesh.vertices if v.co.x < -.039 and v.co.z>.094],1,'REPLACE')
body["gruix_paret_mm"]=2.0
# Radius and volume consistent with the cylindrical interior above the base.
R=.01415
def wrap(x,z):
    a=x/R
    return (R*math.sin(a),-R*math.cos(a),z)
def patch(name,x0,x1,z0,z1,material):
    v=[];f=[];steps=max(2,int(abs(x1-x0)/.0007))
    for i in range(steps+1):
        x=x0+(x1-x0)*i/steps
        v.extend([wrap(x,z0),wrap(x,z1)])
    for i in range(steps):f.append((2*i,2*i+2,2*i+3,2*i+1))
    me=bpy.data.meshes.new(name);me.from_pydata(v,[],f);me.update()
    ob=link_obj(name,me,model);ob.parent=root;me.materials.append(material)
    return ob
font=None
for path in [r"C:\Windows\Fonts\arial.ttf",r"C:\Windows\Fonts\segoeui.ttf"]:
    if os.path.exists(path):
        font=bpy.data.fonts.load(path);break
def label(name,body_text,x,z,size,material=ink):
    cu=bpy.data.curves.new(name,'FONT');cu.body=body_text;cu.size=size;cu.resolution_u=10
    if font:cu.font=font
    ob=link_obj(name,cu,model)
    bpy.context.view_layer.objects.active=ob
    ob.select_set(True)
    bpy.ops.object.convert(target='MESH')
    ob=bpy.context.object
    for v in ob.data.vertices:
        v.co=wrap(x+v.co.x,z+v.co.y)
    ob.data.materials.append(material);ob.parent=root;ob.select_set(False)
    return ob
zlevel=lambda ml:.010+(ml*.4)*1e-6/(math.pi*.0125**2)
mark_objs=[]
for ml in range(2,251,2):
    z=zlevel(ml)
    major=ml%10==0
    width=.008 if major else (.0055 if ml%5==0 else .0035)
    mark_objs.append(patch("Marca_%03d_ml"%ml,-.006,-.006+width,z-.00012,z+.00012,ink))
    if major:mark_objs.append(label("Numero_%d_ml"%ml,str(ml),.003,z-.0015,.004))
mark_objs.append(label("Unitat","mL",.003,zlevel(250)+.006,.0035))
bpy.ops.object.select_all(action='DESELECT')
for ob in mark_objs:ob.select_set(True)
bpy.context.view_layer.objects.active=mark_objs[0];bpy.ops.object.join()
bpy.context.object.name="Escala_proveta_1_250mL"
label("Capacitat","250 mL",-.009,.020,.0035)
# Stable hexagonal foot.
bpy.ops.mesh.primitive_cylinder_add(vertices=6,radius=.031,depth=.006,location=(0,0,.003))
foot=bpy.context.object;foot.name="Base_hexagonal_proveta"
for col in list(foot.users_collection):col.objects.unlink(foot)
model.objects.link(foot);foot.parent=root;foot.data.materials.append(glass)
bevel=foot.modifiers.new("Vores_arrodonides",'BEVEL');bevel.width=.001;bevel.segments=3
bpy.context.view_layer.objects.active=foot;bpy.ops.object.modifier_apply(modifier=bevel.name)
foot.select_set(False)
# studio
floor_mat=mat("Fons · gris perla",(.29,.335,.36),.7)
me=bpy.data.meshes.new("Pla_estudi");me.from_pydata([(-2,-2,-.0005),(2,-2,-.0005),(2,2,-.0005),(-2,2,-.0005)],[],[(0,1,2,3)])
floor=link_obj("Superficie_estudi",me,studio);me.materials.append(floor_mat)
world=bpy.data.worlds.new("Llum ambient suau");world.use_nodes=True;scene.world=world
bg=next(n for n in world.node_tree.nodes if n.type=='BACKGROUND');bg.inputs[0].default_value=(.65,.71,.77,1);bg.inputs[1].default_value=.35
def point(ob,at):ob.rotation_euler=(Vector(at)-ob.location).to_track_quat('-Z','Y').to_euler()
def area(name,loc,power,size,scale=1):
    ld=bpy.data.lights.new(name,'AREA');ld.energy=power;ld.shape='RECTANGLE';ld.size=size;ld.size_y=size*scale
    ob=link_obj(name,ld,studio);ob.location=loc;point(ob,(0,0,.055))
area("Softbox_esquerra",(-.14,-.08,.18),9,.08,2.4)
area("Softbox_dreta",(.15,.04,.14),12,.06,2.6)
area("Softbox_superior",(-.03,.06,.25),6,.13)
cam_data=bpy.data.cameras.new("Camera");cam=link_obj("Camera_presentacio",cam_data,studio)
cam.location=(.008,-.40,.18);point(cam,(0,0,.116));cam_data.type='ORTHO';cam_data.ortho_scale=.29;cam_data.lens=55
scene.camera=cam;cam_data.clip_start=.001
try: scene.render.engine='CYCLES'
except TypeError: pass
if scene.render.engine=='CYCLES':
    scene.cycles.samples=64;scene.cycles.use_denoising=True
    scene.cycles.max_bounces=12;scene.cycles.transmission_bounces=8
scene.render.resolution_x=1000;scene.render.resolution_y=1100;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG'
scene.render.filepath=os.path.join(out,"proveta_250ml.png")
bpy.ops.object.select_all(action='DESELECT')
body.select_set(True);bpy.context.view_layer.objects.active=body
for screen in bpy.data.screens:
    for ar in screen.areas:
        if ar.type=='VIEW_3D':
            ar.spaces.active.clip_start=.001
            ar.spaces.active.region_3d.view_distance=.22
            ar.spaces.active.region_3d.view_location=(0,0,.116)
            ar.spaces.active.region_3d.view_rotation=cam.rotation_euler.to_quaternion()
            ar.spaces.active.shading.type='MATERIAL'

p=next(n for n in glass.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
p.inputs['Base Color'].default_value=(.008,.012,.015,1)
p.inputs['Alpha'].default_value=.065
p.inputs['Transmission Weight'].default_value=0
p.inputs['Roughness'].default_value=.08
p.inputs['Specular IOR Level'].default_value=.15
glass.diffuse_color=(.008,.012,.015,.065)
glass.surface_render_method='BLENDED';glass.use_backface_culling=True
root['tipus']='proveta graduada'
root['escala']='2 a 250 ml; divisions de 2 ml'
body.name='Vidre_proveta_250ml'
body['gruix_paret_mm']=1.5
scene.cycles.transparent_max_bounces=16
scene.cycles.samples=48
scene.render.resolution_percentage=100

from mathutils import Matrix
sz=1.38
sr=(2.5/sz)**.5
matrix=Matrix.Diagonal((sr,sr,sz,1.0))
for ob in model.objects:
    if ob.type=='MESH':ob.data.transform(matrix)
for ob in studio.objects:
    if ob.type=='MESH':ob.data.transform(Matrix.Scale(sz,4))
    else:ob.location*=sz
    if ob.type=='LIGHT':
        ob.data.energy*=sz**2;ob.data.size*=sz;ob.data.size_y*=sz
cam.data.ortho_scale*=sz
root['capacitat_ml']=250
root['unitats']='metres; escala comuna entre tots els estris'
root['altura_mm']=231.9*sz
root['diametre_interior_mm']=25*sr
root['divisio_ml']=2
body['gruix_paret_mm']=1.5*sr
bpy.ops.object.select_all(action='DESELECT')
for ob in model.objects:ob.select_set(True)
bpy.context.view_layer.objects.active=body
bpy.ops.export_scene.gltf(filepath=os.path.join(out,'proveta_250ml.glb'),export_format='GLB',use_selection=True,use_active_scene=True,export_extras=True,export_animations=False)
bpy.data.libraries.write(os.path.join(out,'proveta_250ml.blend'),{scene},fake_user=True,compress=True)
bm=bmesh.new();bm.from_mesh(body.data);print('Boundary edges',sum(not e.is_manifold for e in bm.edges));bm.free()
def render_proveta():
    bpy.ops.render.render(write_still=True)
    return None
bpy.app.timers.register(render_proveta,first_interval=.3)
