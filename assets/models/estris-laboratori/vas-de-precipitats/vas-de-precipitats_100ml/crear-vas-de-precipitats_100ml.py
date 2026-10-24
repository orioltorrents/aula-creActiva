import bpy, math, os, bmesh
from mathutils import Vector
out = r"D:\77 - Intermunicipal\Curs 2025-2026\blender\estris-laboratori\vas-de-precipitats\vas-de-precipitats_100ml"
os.makedirs(out, exist_ok=True)
scene=bpy.data.scenes.new("Vas de precipitats · 100 ml")
bpy.context.window.scene=scene
scene.unit_settings.system='METRIC'
scene.unit_settings.scale_length=1.0
model=bpy.data.collections.new("VAS 100mL · model exportable")
scene.collection.children.link(model)
studio=bpy.data.collections.new("ESTUDI 100mL · camera i llums")
scene.collection.children.link(studio)
def link_obj(name,data,col):
    ob=bpy.data.objects.new(name if name.endswith("100mL") else name+"_100mL",data);col.objects.link(ob);return ob
root=link_obj("vas-de-precipitats_100ml",None,model)
root["capacitat_ml"]=100
root["tipus"]="vas de precipitats"
root["escala"]="10 a 100 ml; graduacio aproximada"
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
profile=[(0,0),(.027,0),(.037,0),(.040,.0006),(.042,.002),(.043,.004),(.043,.007),(.043,.020),(.043,.050),(.043,.080),(.043,.092),(.043,.098),(.0432,.103),(.0436,.108),(.0442,.112),(.045,.114)]
# Rounded rolled rim, continuous with both walls.
for j in range(9):
    a=math.pi*j/8
    profile.append((.044+.0015*math.cos(a),.115+.0015*math.sin(a)))
profile +=[(.0425,.113),(.0418,.109),(.0413,.104),(.041,.098),(.041,.092),(.041,.080),(.041,.050),(.041,.020),(.041,.008),(.0405,.0055),(.039,.0035),(.036,.003),(0,.003)]
verts=[]
for r,z in profile:
    for i in range(N):
        a=2*math.pi*i/N
        da=math.atan2(math.sin(a-math.pi), math.cos(a-math.pi))
        bump=math.exp(-0.5*(da/.23)**2)
        t=max(0,min(1,(z-.091)/.024));t=t*t*(3-2*t)
        rr=r+.0105*bump*t
        zz=z-.0022*bump*t
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
zlevel=lambda ml:.003+(ml*5)*1e-6/(math.pi*.041**2)
mark_objs=[]
for ml in range(10,101,10):
    z=zlevel(ml)
    major=ml%20==0
    mark_objs.append(patch("Marca_%03d_ml"%ml,-.004,.014 if major else .008,z-.00024,z+.00024,ink))
    if major:
        mark_objs.append(label("Numero_%d_ml"%ml,str(ml),.016,z-.002,.0060))
mark_objs.append(patch("Linia_vertical_escala",-.0042,-.0038,zlevel(10),zlevel(100),ink))
mark_objs.append(label("Unitat_escala","ml",.017,zlevel(100)+.008,.0048))
mark_objs.append(label("Indicacio_aproximada","APPROX",.016,zlevel(100)-.0049,.0020))
bpy.ops.object.select_all(action='DESELECT')
for ob in mark_objs:ob.select_set(True)
bpy.context.view_layer.objects.active=mark_objs[0];bpy.ops.object.join()
bpy.context.object.name="Escala_graduada_10_100mL"
label("Capacitat_100mL","100 ml",-.034,.025,.007)
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
cam.location=(.04,-.32,.175);point(cam,(-.002,0,.058));cam_data.type='ORTHO';cam_data.ortho_scale=.174;cam_data.lens=55
scene.camera=cam;cam_data.clip_start=.001
try: scene.render.engine='CYCLES'
except TypeError: pass
if scene.render.engine=='CYCLES':
    scene.cycles.samples=64;scene.cycles.use_denoising=True
    scene.cycles.max_bounces=12;scene.cycles.transmission_bounces=8
scene.render.resolution_x=1000;scene.render.resolution_y=1100;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG'
scene.render.filepath=os.path.join(out,"vas-de-precipitats_100ml.png")
bpy.ops.object.select_all(action='DESELECT')
body.select_set(True);bpy.context.view_layer.objects.active=body
for screen in bpy.data.screens:
    for ar in screen.areas:
        if ar.type=='VIEW_3D':
            ar.spaces.active.clip_start=.001
            ar.spaces.active.region_3d.view_distance=.22
            ar.spaces.active.region_3d.view_location=(0,0,.058)
            ar.spaces.active.region_3d.view_rotation=cam.rotation_euler.to_quaternion()
            ar.spaces.active.shading.type='MATERIAL'

import bpy, math, bmesh, os
from mathutils import Vector
s=scene
glass=body.active_material
glass.name="Vidre transparent · compatible web"
p=next(n for n in glass.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
p.inputs['Base Color'].default_value=(.008,.012,.015,1)
p.inputs['Alpha'].default_value=.065
p.inputs['Transmission Weight'].default_value=0
p.inputs['Roughness'].default_value=.08
p.inputs['Specular IOR Level'].default_value=.15
glass.diffuse_color=(.008,.012,.015,.065)
glass.surface_render_method='BLENDED'
glass.use_backface_culling=True
if hasattr(glass,'use_transparency_overlap'):glass.use_transparency_overlap=False
# A separate liquid mesh. Only the upper vertices move; bottom and meniscus curvature stay fixed.
zmark=lambda ml:.003+(ml*5)*1e-6/(math.pi*.041**2)
rad=.0407; seg=160
radii=[0,.01,.02,.03,.035,.037,.038,.039,.0395,.040,.0403,.0405,rad]
v=[];f=[]
for r in radii:
    h=.00125*(math.exp((r-rad)/.0009)-math.exp(-rad/.0009))
    for i in range(seg):
        a=2*math.pi*i/seg
        v.append((r*math.cos(a),r*math.sin(a),zmark(20)+h))
top_count=len(v)
for ri in range(len(radii)-1):
    for i in range(seg):
        k=(i+1)%seg
        f.append((ri*seg+i,(ri+1)*seg+i,(ri+1)*seg+k,ri*seg+k))
bottom_index=len(v)
for i in range(seg):
    a=2*math.pi*i/seg;v.append((rad*math.cos(a),rad*math.sin(a),.0033))
outer=(len(radii)-1)*seg
for i in range(seg):
    k=(i+1)%seg
    f.append((outer+i,bottom_index+i,bottom_index+k,outer+k))
f.append(tuple(reversed(range(bottom_index,bottom_index+seg))))
me=bpy.data.meshes.new('Liquid_amb_menisc_concau');me.from_pydata(v,[],f);me.update()
bm=bmesh.new();bm.from_mesh(me);bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=1e-8);bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(me);bm.free()
liquid=bpy.data.objects.new('Liquid_blau_100mL_nivell_variable',me);model.objects.link(liquid);liquid.parent=root
for poly in me.polygons:poly.use_smooth=len(poly.vertices)<seg
lm=bpy.data.materials.new('Liquid blau · contrast didactic');lm.use_nodes=True
lp=next(n for n in lm.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
lp.inputs['Base Color'].default_value=(.001,.02,.18,1)
lp.inputs['Roughness'].default_value=.17
lp.inputs['Alpha'].default_value=.5
lp.inputs['Specular IOR Level'].default_value=.04
lm.diffuse_color=(.001,.02,.18,.5);lm.surface_render_method='BLENDED';lm.use_backface_culling=True
me.materials.append(lm)
basis=liquid.shape_key_add(name='Nivell_20_ml')
key=liquid.shape_key_add(name='Nivell_100_ml')
delta=zmark(100)-zmark(20)
for i,vert in enumerate(me.vertices):
    if vert.co.z>.004:key.data[i].co.z+=delta
key.value=.5
root['nivell_ml']=60.0
root.id_properties_ui('nivell_ml').update(min=20,max=100,soft_min=20,soft_max=100,description='Nivell del fons del menisc. Escala aproximada.')
driver=key.driver_add('value').driver
driver.type='SCRIPTED'
var=driver.variables.new();var.name='nivell';var.type='SINGLE_PROP';var.targets[0].id_type='OBJECT';var.targets[0].id=root;var.targets[0].data_path='["nivell_ml"]'
driver.expression='(nivell-20)/80'
liquid['mostrar_liquid']='Amaga aquest objecte per mostrar el vas buit'
liquid['nivell_min_ml']=20;liquid['nivell_max_ml']=100
liquid['web']='morphTargetInfluences[0] = (ml - 20) / 80'
root['escala']='Lectura aproximada; no es material volumetric de precisio.'

# Scale the original 500 ml geometry by the cube root of the volume ratio.
# This preserves proportions while giving the 100 ml mark its corresponding volume.
from mathutils import Matrix
factor=(100.0/500.0)**(1.0/3.0)
for ob in model.objects:
    if ob.type=='MESH':
        ob.data.transform(Matrix.Scale(factor,4),shape_keys=True)
body["gruix_paret_mm"]=2.0*factor
root["alcada_mm"]=116.5*factor
root["diametre_cos_mm"]=86.0*factor
root["capacitat_ml"]=100
for ob in studio.objects:
    if ob.type=='MESH':ob.data.transform(Matrix.Scale(factor,4))
    else:ob.location*=factor
    if ob.type=='LIGHT':
        ob.data.energy*=factor**2
        ob.data.size*=factor
        ob.data.size_y*=factor
cam.data.ortho_scale*=factor
cam.data.clip_start=.0005
s=scene
s.cycles.samples=48
s.cycles.transparent_max_bounces=16
s.render.resolution_percentage=85
s.frame_set(2);s.frame_set(1)
for ml in [20.0,60.0,100.0]:
    root["nivell_ml"]=ml
    root.update_tag()
    s.frame_set(2);s.frame_set(1)
    bpy.context.view_layer.update()
    assert abs(key.value-(ml-20)/80)<1e-5, "Liquid driver invalid"
root["nivell_ml"]=60.0
root.update_tag();s.frame_set(2);s.frame_set(1)
def set_view(pos):
    cam.location=Vector(pos)*factor
    cam.rotation_euler=(Vector((0,0,.058))*factor-cam.location).to_track_quat('-Z','Y').to_euler()
set_view((0,-.32,.058))
for screen in bpy.data.screens:
    for ar in screen.areas:
        if ar.type=='VIEW_3D':
            ar.spaces.active.clip_start=.0005
            ar.spaces.active.shading.type='MATERIAL'
            ar.spaces.active.shading.use_scene_world=True
            ar.spaces.active.shading.use_scene_lights=True
            ar.spaces.active.region_3d.view_location=(0,0,.058*factor)
            ar.spaces.active.region_3d.view_distance=.23*factor
            ar.spaces.active.region_3d.view_rotation=cam.rotation_euler.to_quaternion()
bpy.ops.object.select_all(action='DESELECT')
for ob in model.objects:ob.select_set(True)
liquid.select_set(False)
bpy.context.view_layer.objects.active=body
bpy.ops.export_scene.gltf(filepath=os.path.join(out,'vas-de-precipitats_100ml.glb'),export_format='GLB',use_selection=True,use_active_scene=True,export_extras=True,export_animations=False)
liquid.select_set(True)
bpy.ops.export_scene.gltf(filepath=os.path.join(out,'vas-de-precipitats_100ml-amb-liquid.glb'),export_format='GLB',use_selection=True,use_active_scene=True,export_extras=True,export_animations=False)
bpy.data.libraries.write(os.path.join(out,'vas-de-precipitats_100ml.blend'),{s},fake_user=True,compress=True)
bm=bmesh.new();bm.from_mesh(body.data)
assert all(e.is_manifold for e in bm.edges)
bm.free()
print("100 ml ready:",out,"height_mm",root["alcada_mm"],"fill",root["nivell_ml"])
def render_100ml_set():
    s.render.filepath=os.path.join(out,'lectura-menisc-60-ml.png')
    bpy.ops.render.render(write_still=True)
    set_view((.025,-.32,.135))
    s.render.filepath=os.path.join(out,'vas-de-precipitats_100ml-amb-liquid.png')
    bpy.ops.render.render(write_still=True)
    liquid.hide_render=True
    s.render.filepath=os.path.join(out,'vas-de-precipitats_100ml.png')
    bpy.ops.render.render(write_still=True)
    liquid.hide_render=False
    return None
bpy.app.timers.register(render_100ml_set,first_interval=.3)
