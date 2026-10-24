import bpy, math, os, bmesh
from mathutils import Vector
out = r"D:\77 - Intermunicipal\Curs 2025-2026\blender\estris-laboratori\matras-erlenmeyer\matras-erlenmeyer_500ml"
os.makedirs(out, exist_ok=True)
scene=bpy.data.scenes.new("Erlenmeyer · 500 ml")
bpy.context.window.scene=scene
scene.unit_settings.system='METRIC'
scene.unit_settings.scale_length=1.0
model=bpy.data.collections.new("ERLENMEYER · model")
scene.collection.children.link(model)
studio=bpy.data.collections.new("ESTUDI · camera i llums")
scene.collection.children.link(studio)
def link_obj(name,data,col):
    ob=bpy.data.objects.new(name+"_Erlenmeyer",data);col.objects.link(ob);return ob
root=link_obj("Erlenmeyer_500mL",None,model)
root["capacitat_ml"]=500
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
ink=mat("Escala · tinta gris grafit",(.004,.006,.008),.9)
next(n for n in ink.node_tree.nodes if n.type=='BSDF_PRINCIPLED').inputs['Specular IOR Level'].default_value=0
panel=mat("Zona de retolacio · esmalt mat",(.48,.51,.51),.7)
N=192
profile=[(0,0),(.040,0),(.049,.001),(.052,.004),(.053,.008)]
outer=[(.053,.008),(.052,.015),(.048,.030),(.043,.050),(.038,.070),(.033,.090),(.028,.110),(.023,.130),(.019,.145),(.018,.153),(.018,.190),(.019,.195)]
profile+=outer[1:]
for j in range(9):
    a=math.pi*j/8
    profile.append((.018+.0015*math.cos(a),.196+.0015*math.sin(a)))
profile +=[(r-.002,z) for r,z in reversed(outer)] +[(.048,.004),(0,.004)]
def radius(z):
    for (r0,z0),(r1,z1) in zip(outer,outer[1:]):
        if z0<=z<=z1:return r0+(r1-r0)*(z-z0)/(z1-z0)
    return outer[0][0] if z<.008 else outer[-1][0]
def level(ml):
    vol=0.0;dz=.00002;z=.004
    while vol<ml*1e-6:
        vol+=math.pi*(radius(z)-.002)**2*dz
        z+=dz
    return z
verts=[]
for r,z in profile:
    for i in range(N):
        a=2*math.pi*i/N
        da=math.atan2(math.sin(a-math.pi), math.cos(a-math.pi))
        bump=math.exp(-0.5*(da/.23)**2)
        t=max(0,min(1,(z-.091)/.024));t=t*t*(3-2*t)
        rr=r
        zz=z
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
R=.04318
def wrap(x,z):
    rad=radius(z)+.00018
    a=x/rad
    return (rad*math.sin(a),-rad*math.cos(a),z)
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
zlevel=level
mark_objs=[]
for ml in range(200,501,50):
    z=zlevel(ml)
    major=ml%100==0
    mark_objs.append(patch("Marca_%03d_ml"%ml,-.004,.014 if major else .008,z-.00024,z+.00024,ink))
    if major:
        mark_objs.append(label("Numero_%d_ml"%ml,str(ml),.016,z-.002,.0060))
mark_objs.append(patch("Linia_vertical_escala",-.0042,-.0038,zlevel(200),zlevel(500),ink))
mark_objs.append(label("Unitat_escala","ml",.017,zlevel(500)+.008,.0048))
mark_objs.append(label("Indicacio_aproximada","APPROX",.016,zlevel(500)-.0049,.0020))
bpy.ops.object.select_all(action='DESELECT')
for ob in mark_objs:ob.select_set(True)
bpy.context.view_layer.objects.active=mark_objs[0];bpy.ops.object.join()
bpy.context.object.name="Escala_graduada_50_500ml"
label("Capacitat_500_ml","500 ml",-.035,.030,.007)
patch("Zona_retolar",-.034,-.012,.037,.049,panel)
label("Material_vidre","BOROSILICAT",-.034,.053,.0025)
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
cam.location=(.025,-.4,.22);point(cam,(-.002,0,.098));cam_data.type='ORTHO';cam_data.ortho_scale=.265;cam_data.lens=55
scene.camera=cam;cam_data.clip_start=.001
try: scene.render.engine='CYCLES'
except TypeError: pass
if scene.render.engine=='CYCLES':
    scene.cycles.samples=64;scene.cycles.use_denoising=True
    scene.cycles.max_bounces=12;scene.cycles.transmission_bounces=8
scene.render.resolution_x=1000;scene.render.resolution_y=1100;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG'
scene.render.filepath=os.path.join(out,"matras-erlenmeyer_500ml.png")
bpy.ops.object.select_all(action='DESELECT')
body.select_set(True);bpy.context.view_layer.objects.active=body
for screen in bpy.data.screens:
    for ar in screen.areas:
        if ar.type=='VIEW_3D':
            ar.spaces.active.clip_start=.001
            ar.spaces.active.region_3d.view_distance=.22
            ar.spaces.active.region_3d.view_location=(0,0,.098)
            ar.spaces.active.region_3d.view_rotation=cam.rotation_euler.to_quaternion()
            ar.spaces.active.shading.type='MATERIAL'

p=next(n for n in glass.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
p.inputs['Base Color'].default_value=(.008,.012,.015,1)
p.inputs['Alpha'].default_value=.065
p.inputs['Transmission Weight'].default_value=0
p.inputs['Roughness'].default_value=.08
p.inputs['Specular IOR Level'].default_value=.15
glass.diffuse_color=(.008,.012,.015,.065)
glass.surface_render_method='BLENDED'
glass.use_backface_culling=True
root['tipus']='matras Erlenmeyer'
root['capacitat_ml']=500
root['escala']='200 a 500 ml, divisions de 50 ml; aproximada'
body.name='Vidre_Erlenmeyer_500mL'
body.vertex_groups.clear()
scene.cycles.transparent_max_bounces=16
scene.cycles.samples=32
scene.render.resolution_percentage=80
bpy.ops.object.select_all(action='DESELECT')
for ob in model.objects:ob.select_set(True)
bpy.context.view_layer.objects.active=body
bpy.ops.export_scene.gltf(filepath=os.path.join(out,'matras-erlenmeyer_500ml.glb'),export_format='GLB',use_selection=True,use_active_scene=True,export_extras=True,export_animations=False)
bpy.data.libraries.write(os.path.join(out,'matras-erlenmeyer_500ml.blend'),{scene},fake_user=True,compress=True)
print('LEVELS',[(ml,round(level(ml),4)) for ml in [200,300,400,500]])
def render_erlenmeyer():
    bpy.ops.render.render(write_still=True)
    return None
bpy.app.timers.register(render_erlenmeyer,first_interval=.3)
