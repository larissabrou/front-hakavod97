import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Plus, Trash2, Save, ArrowUp, ArrowDown, X, Check,
  ChevronDown, ChevronUp, ToggleLeft, ToggleRight,
  Upload, Loader2, Link2, ArrowRight, Eye, EyeOff,
  ImageIcon, Type, Layout, Megaphone, Wrench, Layers,
  ChevronRight, AlertCircle, CheckCircle2, Search, Sparkles,
  Phone, Mail, Globe, Share2, LayoutTemplate, MonitorPlay
} from 'lucide-react';
import adminService from '../../services/api/adminService';
import storeService from '../../services/api/storeService';
import apiClient from '../../services/api/apiClient';
import { HeroSlides } from './HeroSlides';

const fmt = v => v || v===0 ? Number(v).toLocaleString('fr-FR')+' F CFA' : '';

// ── Generic Input Fields ───────────────────────────────────────────────────
const Field = ({label,value,onChange,type='text',placeholder='',className=''}) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">{label}</label>
    <input type={type} value={value??''} onChange={e=>onChange(e.target.value)} placeholder={placeholder} className="border border-neutral-200 py-2 px-3 text-xs text-neutral-800 focus:outline-none focus:border-neutral-800 bg-white" />
  </div>
);
const Textarea = ({label,value,onChange,rows=3,placeholder=''}) => (
  <div className="flex flex-col gap-1">
    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">{label}</label>
    <textarea value={value??''} onChange={e=>onChange(e.target.value)} rows={rows} placeholder={placeholder} className="border border-neutral-200 py-2 px-3 text-xs text-neutral-800 focus:outline-none focus:border-neutral-800 bg-white resize-y" />
  </div>
);
const Toggle = ({label,value,onChange}) => (
  <div className="flex items-center justify-between">
    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">{label}</span>
    <button type="button" onClick={()=>onChange(!value)} className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border transition-all ${value?'bg-emerald-50 border-emerald-300 text-emerald-700':'bg-neutral-100 border-neutral-300 text-neutral-500'}`}>
      {value?<ToggleRight className="w-3.5 h-3.5"/>:<ToggleLeft className="w-3.5 h-3.5"/>}
      {value?'Actif':'Inactif'}
    </button>
  </div>
);
const FormBlock = ({title, children}) => (
  <div className="bg-white border border-neutral-200 overflow-hidden">
    {title && <div className="px-4 py-2.5 bg-neutral-50 border-b border-neutral-200"><p className="text-[10px] font-black uppercase tracking-widest text-neutral-600">{title}</p></div>}
    <div className="p-5 flex flex-col gap-4">{children}</div>
  </div>
);

// ── Two Column Sticky Preview Layout ───────────────────────────────────────
const TwoCol = ({preview, form}) => (
  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start animate-fade-in">
    <div className="xl:sticky xl:top-4 flex flex-col gap-3 order-last xl:order-first">
      <div className="flex items-center gap-2">
        <Layers className="w-3.5 h-3.5 text-neutral-400"/>
        <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Aperçu en temps réel</span>
      </div>
      <div className="border border-neutral-300 overflow-hidden shadow-xs bg-white">
        {preview}
      </div>
      <p className="text-[9px] text-neutral-400 text-center">Rendu exact de la section sur la boutique publique</p>
    </div>
    <div className="flex flex-col gap-4">{form}</div>
  </div>
);

// ══════════════════════════════════════════════════════════════════════════
//  1. SECTIONS PRODUITS (FEATURED PRODUCTS)
// ══════════════════════════════════════════════════════════════════════════
const PromoPreview = ({section}) => {
  const left = section.layout === 'image-left';
  const product = section.product || {};
  const image = product.hero_image?.url || product.images?.[0]?.url || section.image_url || '';
  const price = product.price ?? 0;
  const sizes = product.variants?.map(v => v.size?.name).filter(Boolean).filter((v, i, self) => self.indexOf(v) === i) || [];
  
  const priceVal = price;
  const oldPriceVal = section.compare_at_price;
  let discountPercent = null;
  if (oldPriceVal && oldPriceVal > priceVal) {
    const pct = Math.round(((oldPriceVal - priceVal) / oldPriceVal) * 100);
    discountPercent = `-${pct}%`;
  }

  const imgBlock = (
    <div className="relative bg-[#eae3d8] p-4 flex items-center justify-center" style={{ minHeight: 220 }}>
      <div className="relative w-full h-full bg-white shadow-sm overflow-hidden" style={{ minHeight: 180 }}>
        {image ? (
          <img src={image} alt="" className="absolute inset-0 w-full h-full object-cover object-center" onError={e=>e.target.style.display='none'}/>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-200">
            <ImageIcon className="w-6 h-6 text-neutral-400"/>
          </div>
        )}
        <div className="absolute inset-0 bg-black/5"/>
        {section.badge && (
          <span className="absolute top-2 left-2 text-[8px] tracking-[0.2em] uppercase font-bold bg-[#c5a059] text-white px-2 py-0.5 shadow-sm z-10">
            {section.badge}
          </span>
        )}
      </div>
    </div>
  );

  const textBlock = (
    <div className="flex flex-col justify-center px-6 py-6 bg-[#f5efe6]">
      <p className="text-[8px] font-bold tracking-[0.2em] uppercase mb-1 text-[#c5a059]">{section.label || 'Collection Signature'}</p>
      <h2 className="font-black uppercase leading-tight tracking-tight text-sm text-[#17070a]">
        {product.name || 'Produit à la une'}
      </h2>
      <div className="w-10 h-[1px] bg-[#c5a059] my-3" />
      <p className="text-[9px] leading-relaxed line-clamp-3 text-[#5e5243]">{section.description || product.short_description || 'Pas de description courte renseignée.'}</p>
      <div className="flex items-center gap-2 mt-4 flex-wrap">
        <span className="text-sm font-black text-[#17070a]">{fmt(price)}</span>
        {oldPriceVal && (
          <span className="text-xs line-through text-[#9c9284]">{fmt(oldPriceVal)}</span>
        )}
        {discountPercent && (
          <span className="text-[8px] font-bold text-[#c5a059] bg-[#c5a059]/10 px-1 py-0.5 border border-[#c5a059]/20 tracking-wider">
            {discountPercent}
          </span>
        )}
      </div>
      {sizes.length > 0 && (
        <div className="flex gap-1 mt-3 flex-wrap">
          {sizes.slice(0, 5).map(s=>(
            <span key={s} className="w-7 h-7 border border-[#e7e0d2] bg-white text-[#17070a] flex items-center justify-center text-[9px] font-semibold">{s}</span>
          ))}
        </div>
      )}
      <div className="mt-4 inline-flex items-center gap-1.5 self-start px-4 py-2 text-[9px] font-bold uppercase tracking-widest bg-[#17070a] text-white">
        Voir le produit <span className="ml-0.5">→</span>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-2 overflow-hidden border border-neutral-200" style={{minHeight:220}}>
      {left?<>{imgBlock}{textBlock}</>:<>{textBlock}{imgBlock}</>}
    </div>
  );
};

const PromoEditor = ({isDarkMode, setSuccess, setError}) => {
  const [sections, setSections] = useState([]);
  const [products, setProducts] = useState([]);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  // Ref pour toujours accéder à la dernière version de sections dans les callbacks
  const sectionsRef = useRef(sections);
  useEffect(() => { sectionsRef.current = sections; }, [sections]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [featRes, prodRes] = await Promise.all([
        adminService.getHomeFeaturedProducts(),
        adminService.getProducts({ per_page: 100 })
      ]);
      const featData = featRes?.data || featRes;
      const featList = Array.isArray(featData) ? featData : [];
      const prodData = prodRes?.data?.data || prodRes?.data || prodRes;
      const prodList = Array.isArray(prodData) ? prodData : [];

      // Auto-remplir la description depuis le produit associé si elle est vide
      setSections(featList.map((item, idx) => {
        const linkedProduct = prodList.find(p => p.id === item.product_id);
        return {
          ...item,
          description: item.description || linkedProduct?.description || linkedProduct?.short_description || '',
          layout: item.layout || (idx % 2 === 0 ? 'image-left' : 'image-right')
        };
      }));
      setProducts(prodList);
    } catch (e) {
      console.error('[PromoEditor] Erreur loadData:', e?.response?.data || e);
      setError('Erreur lors du chargement des données. Veuillez vérifier la console.');
    } finally {
      setLoading(false);
    }
  }, [setError]);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    const currentSection = sections[active];
    if (!file || !currentSection?.product_id) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await adminService.uploadProductHeroImage(currentSection.product_id, fd);
      const updatedProduct = res?.data || res;
      
      // Update local state image
      setSections(prev => prev.map(s => s.id === currentSection.id ? {
        ...s,
        product: {
          ...s.product,
          hero_image: updatedProduct.hero_image || { url: updatedProduct.hero_image_url || updatedProduct.image_url }
        }
      } : s));
      setSuccess('Image de couverture mise à jour avec succès.');
    } catch (err) {
      setError('Erreur lors de l\'upload de l\'image de couverture.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onUpdateFieldLocal = (id, field, value) => {
    const current = sections.find(s => s.id === id);
    let updates = { [field]: value };
    if (field === 'product_id') {
      const newProduct = products.find(p => p.id === value);
      updates.product = newProduct;
      // Auto-remplir la description depuis le nouveau produit si la section n'a pas de description perso
      if (!current.description || current.description === (current.product?.description || '') || current.description === (current.product?.short_description || '')) {
        updates.description = newProduct?.description || newProduct?.short_description || '';
      }
    }
    setSections(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const onSaveSection = async (id) => {
    setSaving(prev => ({ ...prev, [id]: true }));
    try {
      // On utilise sectionsRef.current pour éviter le stale closure
      const current = sectionsRef.current.find(s => s.id === id);
      if (!current) throw new Error('Section introuvable');
      const updated = {
        product_id: current.product_id,
        badge: current.badge,
        label: current.label,
        description: current.description,
        compare_at_price: current.compare_at_price,
        is_active: current.is_active,
        sort_order: current.sort_order
      };
      console.log('[PromoEditor] Enregistrement section', id, updated);
      await adminService.updateHomeFeaturedProduct(id, updated);
      setSuccess('Modifications enregistrées avec succès.');
    } catch (e) {
      console.error('[PromoEditor] Erreur save:', e?.response?.data || e);
      setError(e?.response?.data?.message || 'Erreur lors de la sauvegarde.');
    } finally {
      setSaving(prev => ({ ...prev, [id]: false }));
    }
  };

  const onDelete = async id => {
    if (!confirm('Voulez-vous retirer ce produit de la page d\'accueil ?')) return;
    try {
      await adminService.deleteHomeFeaturedProduct(id);
      setSections(prev => prev.filter(s => s.id !== id));
      setActive(Math.max(0, active - 1));
      setSuccess('Produit retiré de la page d\'accueil.');
    } catch (e) {
      setError('Impossible de retirer le produit.');
    }
  };

  const onAdd = async productId => {
    try {
      const res = await adminService.addHomeFeaturedProduct({
        product_id: productId,
        is_active: true,
        sort_order: sections.length
      });
      setSuccess('Produit ajouté à la une.');
      loadData();
      setActive(sections.length);
    } catch (e) {
      setError(e?.response?.data?.message || 'Erreur lors de l\'ajout.');
    }
  };

  const onMove = async (idx, dir) => {
    const list = [...sections];
    const target = idx + dir;
    if (target < 0 || target >= list.length) return;
    [list[idx], list[target]] = [list[target], list[idx]];
    
    try {
      const orderedIds = list.map(item => item.id);
      await adminService.reorderHomeFeaturedProducts(orderedIds);
      setSections(list.map((item, i) => ({ ...item, sort_order: i })));
      setActive(target);
      setSuccess('Ordre mis à jour.');
    } catch (e) {
      setError('Erreur lors du réordonnement.');
    }
  };

  if (loading) return <div className="py-16 text-center text-neutral-400 text-xs uppercase tracking-widest animate-pulse">Chargement…</div>;

  const currentSection = sections[active];

  return (
    <div className="flex flex-col gap-0">
      <div className="flex items-end gap-0 border-b border-neutral-200 mb-6 overflow-x-auto">
        {sections.map((s, idx) => (
          <button key={s.id} type="button" onClick={() => setActive(idx)}
            className={`flex items-center gap-2 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-all ${active===idx?'border-neutral-900 text-neutral-900 bg-white':'border-transparent text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50'}`}>
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black ${active===idx?'bg-neutral-900 text-white':'bg-neutral-200 text-neutral-500'}`}>{idx+1}</span>
            {s.product?.name || `Produit ${idx+1}`}
            {saving[s.id] && <Loader2 className="w-2.5 h-2.5 animate-spin text-neutral-500"/>}
            <span className={`w-1.5 h-1.5 rounded-full ${s.is_active?'bg-emerald-400':'bg-neutral-300'}`}/>
          </button>
        ))}
        <div className="flex-1"/>
      </div>

      {sections.length === 0 ? (
        <div className="py-12 text-center border border-dashed border-neutral-300 bg-neutral-50/50">
          <p className="text-neutral-400 text-xs mb-4">Aucun produit à la une configuré sur la page d'accueil.</p>
          <div className="max-w-xs mx-auto">
            <select onChange={e => e.target.value && onAdd(Number(e.target.value))} className="w-full border border-neutral-300 py-2 px-3 text-xs bg-white focus:outline-none">
              <option value="">+ Ajouter un produit à la une...</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>
      ) : (
        currentSection && (
          <TwoCol
            preview={<PromoPreview section={currentSection}/>}
            form={
              <>
                <FormBlock title="Sélection du produit">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Produit associé</label>
                    <select
                      value={currentSection.product_id}
                      onChange={e => onUpdateFieldLocal(currentSection.id, 'product_id', Number(e.target.value))}
                      className="border border-neutral-200 py-2 px-3 text-xs text-neutral-800 focus:outline-none focus:border-neutral-800 bg-white"
                    >
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <Toggle label="Activer la mise en avant" value={currentSection.is_active} onChange={v=>onUpdateFieldLocal(currentSection.id, 'is_active', v)}/>
                </FormBlock>

                <FormBlock title="Badges & Accroches">
                  <Field label="Surtitre / Tag (doré)" value={currentSection.label || ''} onChange={v=>onUpdateFieldLocal(currentSection.id, 'label', v)} placeholder="COLLECTION SIGNATURE"/>
                  <Field label="Badge promotionnel (ex: BEST-SELLER)" value={currentSection.badge || ''} onChange={v=>onUpdateFieldLocal(currentSection.id, 'badge', v)} placeholder="BEST-SELLER, NOUVEAUTÉ..."/>
                  <Textarea label="Description de la section" value={currentSection.description || ''} onChange={v=>onUpdateFieldLocal(currentSection.id, 'description', v)} rows={3} placeholder="L'élégance à l'état pur. Confectionné en cuir grainé pleine fleur..."/>
                  <Field label="Ancien prix de référence (XOF, pour afficher une promo)" type="number" value={currentSection.compare_at_price || ''} onChange={v=>onUpdateFieldLocal(currentSection.id, 'compare_at_price', v ? Number(v) : null)} placeholder="150000"/>
                </FormBlock>

                <FormBlock title="Disposition & Médias">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Layout de l'image (Aperçu local)</label>
                    <div className="flex gap-2">
                      {[['image-left','◧ Image à gauche'],['image-right','◨ Image à droite']].map(([v,l])=>(
                        <button key={v} type="button" onClick={() => setSections(prev => prev.map(s => s.id === currentSection.id ? { ...s, layout: v } : s))} className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider border transition-colors ${currentSection.layout===v?'bg-neutral-900 text-white border-neutral-900':'border-neutral-300 text-neutral-500 hover:border-neutral-700'}`}>{l}</button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 mt-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Image de couverture (Hero Produit)</label>
                    <div className="relative border-2 border-dashed border-neutral-300 hover:border-neutral-500 bg-neutral-50 cursor-pointer p-6 flex flex-col items-center justify-center gap-2" onClick={() => !uploading && fileRef.current?.click()}>
                      <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      
                      {uploading ? (
                        <div className="flex flex-col items-center gap-1.5">
                          <Loader2 className="w-5 h-5 text-accent animate-spin" />
                          <span className="text-[9px] font-bold text-neutral-400">Upload de l'image...</span>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-5 h-5 text-neutral-400"/>
                          <p className="text-[11px] font-bold text-neutral-600">Cliquez pour modifier la couverture</p>
                        </>
                      )}
                    </div>
                  </div>
                </FormBlock>

                <div className="mt-4 mb-6 flex justify-end">
                  <button
                    type="button"
                    onClick={() => onSaveSection(currentSection.id)}
                    disabled={saving[currentSection.id]}
                    className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-widest transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {saving[currentSection.id] ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Enregistrement...
                      </>
                    ) : (
                      'Enregistrer'
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
                  <div className="flex gap-2">
                    <button type="button" onClick={()=>onMove(active, -1)} disabled={active===0} className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold border border-neutral-300 text-neutral-600 hover:border-neutral-700 disabled:opacity-30 transition-colors uppercase tracking-wider">
                      <ArrowUp className="w-3 h-3"/> Remonter
                    </button>
                    <button type="button" onClick={()=>onMove(active, 1)} disabled={active===sections.length-1} className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold border border-neutral-300 text-neutral-600 hover:border-neutral-700 disabled:opacity-30 transition-colors uppercase tracking-wider">
                      <ArrowDown className="w-3 h-3"/> Descendre
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <select onChange={e => { if(e.target.value) { onAdd(Number(e.target.value)); e.target.value = ''; } }} className="border border-neutral-300 py-1.5 px-3 text-[10px] font-bold uppercase tracking-wider bg-white">
                      <option value="">+ Ajouter un autre...</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                    <button type="button" onClick={()=>onDelete(currentSection.id)} className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-red-600 border border-red-200 hover:bg-red-50 transition-colors">
                      <Trash2 className="w-3 h-3"/> Retirer
                    </button>
                  </div>
                </div>
              </>
            }
          />
        )
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════
//  2. BLOC ARTISANAT (HOME EDITORIAL BLOCKS)
// ══════════════════════════════════════════════════════════════════════════
const CraftPreview = ({block}) => (
  <div className="grid grid-cols-2 overflow-hidden" style={{minHeight:200}}>
    <div className="relative overflow-hidden">
      {block.image_url ? <img src={block.image_url} alt="" className="absolute inset-0 w-full h-full object-cover" onError={e=>e.target.style.display='none'}/> : <div className="absolute inset-0 flex items-center justify-center bg-neutral-200"><ImageIcon className="w-6 h-6 text-neutral-400"/></div>}
      <div className="absolute inset-0 bg-black/20" />
    </div>
    <div className="flex flex-col justify-center px-7 py-8 bg-neutral-50">
      <p className="text-[8px] font-bold tracking-[0.4em] uppercase mb-2" style={{color:'#C5A059'}}>{block.label}</p>
      <h2 className="font-black text-neutral-900 uppercase leading-tight tracking-tight text-sm whitespace-pre-line">{block.title}</h2>
      <div className="w-7 h-0.5 my-3" style={{background:'#C5A059'}} />
      <p className="text-neutral-500 text-[10px] leading-loose">{block.description}</p>
      <ul className="mt-3 flex flex-col gap-1.5">
        {(block.bullets||[]).slice(0, 4).map((b,i)=>(
          <li key={i} className="flex items-start gap-2 text-[10px] text-neutral-600">
            <span className="w-1.5 h-1.5 rounded-full mt-1 shrink-0" style={{background:'#C5A059'}}/>{b}
          </li>
        ))}
      </ul>
    </div>
  </div>
);

const CraftEditor = ({isDarkMode, setSuccess, setError}) => {
  const [blocks, setBlocks] = useState([]);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(true);
  const [newBullet, setNewBullet] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const loadBlocks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminService.getHomeBlocks();
      const list = (res?.data || res || []).filter(b => b.slug !== 'cta');
      if (list.length === 0) {
        const defaultBlock = await adminService.createHomeBlock({
          slug: 'savoir-faire',
          layout: 'split',
          title: DEFAULT_CRAFT.title,
          label: DEFAULT_CRAFT.tag,
          description: DEFAULT_CRAFT.description,
          bullets: DEFAULT_CRAFT.bullets,
          is_active: true,
          sort_order: 0
        });
        setBlocks([defaultBlock?.data || defaultBlock]);
      } else {
        setBlocks(list);
      }
    } catch (e) {
      setError('Erreur lors du chargement du bloc Artisanat.');
    } finally {
      setLoading(false);
    }
  }, [setError]);

  useEffect(() => {
    loadBlocks();
  }, [loadBlocks]);

  const onUpdateBlock = async (id, updatedFields) => {
    try {
      const current = blocks.find(b => b.id === id);
      const merged = {
        slug: current.slug,
        layout: 'split',
        label: current.label,
        title: current.title,
        description: current.description,
        bullets: current.bullets,
        is_active: current.is_active,
        sort_order: current.sort_order,
        ...updatedFields
      };
      await adminService.updateHomeBlock(id, merged);
      setBlocks(prev => prev.map(b => b.id === id ? { ...b, ...updatedFields } : b));
      setSuccess('Modifications enregistrées.');
    } catch (e) {
      setError('Erreur lors de la mise à jour.');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const current = blocks[active];
    if (!current) return;

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await adminService.uploadHomeBlockImage(current.id, fd);
      const updated = res?.data || res;
      setBlocks(prev => prev.map(b => b.id === current.id ? { ...b, image_url: updated.image_url } : b));
      setSuccess('Image mise à jour.');
    } catch (err) {
      setError('Erreur lors de l\'upload de l\'image.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const addB = () => {
    const current = blocks[active];
    if (!newBullet.trim() || !current) return;
    const bullets = [...(current.bullets || []), newBullet.trim()];
    onUpdateBlock(current.id, { bullets });
    setNewBullet('');
  };

  const delB = idx => {
    const current = blocks[active];
    if (!current) return;
    const bullets = current.bullets.filter((_, i) => i !== idx);
    onUpdateBlock(current.id, { bullets });
  };

  if (loading) return <div className="py-16 text-center text-neutral-400 text-xs uppercase tracking-widest animate-pulse">Chargement…</div>;

  const currentBlock = blocks[active];

  return (
    currentBlock ? (
      <TwoCol
        preview={<CraftPreview block={currentBlock}/>}
        form={
          <>
            <FormBlock title="Statut & Image">
              <Toggle label="Afficher cette section sur la boutique" value={currentBlock.is_active} onChange={v => onUpdateBlock(currentBlock.id, { is_active: v })}/>
              
              <div className="flex flex-col gap-2 mt-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Photo d'illustration</label>
                <div className="relative border-2 border-dashed border-neutral-300 hover:border-neutral-500 bg-neutral-50 cursor-pointer p-6 flex flex-col items-center justify-center gap-2" onClick={() => !uploading && fileRef.current?.click()}>
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  
                  {uploading ? (
                    <div className="flex flex-col items-center gap-1.5">
                      <Loader2 className="w-5 h-5 text-accent animate-spin" />
                      <span className="text-[9px] font-bold text-neutral-400">Upload de l'image...</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-neutral-400"/>
                      <p className="text-[11px] font-bold text-neutral-600">Cliquez pour modifier la photo</p>
                    </>
                  )}
                </div>
              </div>
            </FormBlock>

            <FormBlock title="Textes & Accroches">
              <Field label="Tag (doré)" value={currentBlock.label} onChange={v => onUpdateBlock(currentBlock.id, { label: v })} placeholder="NOTRE SAVOIR-FAIRE"/>
              <Textarea label="Titre principal (\n pour saut de ligne)" value={currentBlock.title} onChange={v => onUpdateBlock(currentBlock.id, { title: v })} rows={2}/>
              <Textarea label="Paragraphe descriptif" value={currentBlock.description} onChange={v => onUpdateBlock(currentBlock.id, { description: v })} rows={4}/>
            </FormBlock>

            <FormBlock title="Points clés (liste à puces)">
              <div className="flex flex-col gap-2">
                {(currentBlock.bullets || []).map((b, idx) => (
                  <div key={idx} className="flex items-center gap-2 group p-2 border border-neutral-100 bg-neutral-50">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-accent"/>
                    <span className="flex-1 text-xs text-neutral-700">{b}</span>
                    <button type="button" onClick={() => delB(idx)} className="p-1 text-neutral-400 hover:text-red-600 transition-colors">
                      <X className="w-3.5 h-3.5"/>
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <input type="text" value={newBullet} onChange={e => setNewBullet(e.target.value)} onKeyDown={e => e.key==='Enter' && addB()} placeholder="Ajouter un point clé..." className="flex-1 border border-neutral-200 py-2 px-3 text-xs focus:outline-none focus:border-neutral-800 bg-white"/>
                <button type="button" onClick={addB} className="px-4 py-2 bg-neutral-900 text-white hover:bg-accent transition-colors"><Plus className="w-3.5 h-3.5"/></button>
              </div>
            </FormBlock>
          </>
        }
      />
    ) : null
  );
};

// ══════════════════════════════════════════════════════════════════════════
//  3. BANDEAU CTA
// ══════════════════════════════════════════════════════════════════════════
const CTAPreview = ({block}) => {
  const imgVAlignRaw = block.bullets?.[1] || '50';
  const overlayOpacity = block.bullets?.[2] || '60';
  const useParallax = block.bullets?.[3] === 'true';
  const imgHAlignRaw = block.bullets?.[4] || '50';
  const bannerHeightRaw = block.bullets?.[5] || '60';
  const imgFit = block.bullets?.[6] || 'cover';
  
  const imgVAlign = imgVAlignRaw === 'top' ? '0%' : imgVAlignRaw === 'center' ? '50%' : imgVAlignRaw === 'bottom' ? '100%' : (isNaN(Number(imgVAlignRaw)) ? imgVAlignRaw : `${imgVAlignRaw}%`);
  const imgHAlign = imgHAlignRaw === 'left' ? '0%' : imgHAlignRaw === 'center' ? '50%' : imgHAlignRaw === 'right' ? '100%' : (isNaN(Number(imgHAlignRaw)) ? imgHAlignRaw : `${imgHAlignRaw}%`);
  
  let previewHeight = 180;
  if (bannerHeightRaw === 'small') previewHeight = 140;
  else if (bannerHeightRaw === 'medium') previewHeight = 180;
  else if (bannerHeightRaw === 'large') previewHeight = 220;
  else if (bannerHeightRaw === 'full') previewHeight = 260;
  else if (!isNaN(Number(bannerHeightRaw))) previewHeight = 120 + (Number(bannerHeightRaw) * 1.5);
  
  const containerStyle = useParallax && block.image_url ? {
    backgroundImage: `url(${block.image_url})`,
    backgroundAttachment: 'fixed',
    backgroundPosition: `${imgHAlign} ${imgVAlign}`,
    backgroundSize: imgFit,
    backgroundRepeat: 'no-repeat',
    height: previewHeight
  } : { height: previewHeight };

  return (
    <div className="relative overflow-hidden flex items-center justify-center transition-all duration-300" style={containerStyle}>
      {!useParallax && block.image_url && (
        <img src={block.image_url} alt="" style={{ objectFit: imgFit, objectPosition: `${imgHAlign} ${imgVAlign}` }} className="absolute inset-0 w-full h-full" onError={e=>e.target.style.display='none'}/>
      )}
      <div className="absolute inset-0" style={{backgroundColor:`rgba(0,0,0,${Number(overlayOpacity)/100})`}}/>
      <div className="relative z-10 text-center px-4">
        <p className="font-bold tracking-[0.5em] uppercase mb-2 text-[8px]" style={{color:'#C5A059'}}>{block.label || 'Collection 2025'}</p>
        <h2 className="font-black text-white uppercase tracking-tight whitespace-pre-line text-lg" style={{lineHeight:1.1}}>{block.title || 'Titre du bandeau'}</h2>
        <div className="mt-4 inline-flex items-center gap-2 font-black uppercase tracking-widest px-7 py-2.5 text-[9px]" style={{background:'#C5A059',color:'#111'}}>
          {block.description || 'Bouton'} <ArrowRight className="w-3 h-3"/>
        </div>
      </div>
    </div>
  );
};

const CTAEditor = ({isDarkMode, setSuccess, setError}) => {
  const [block, setBlock] = useState(null);
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    adminService.getHomeBlocks().then(res => {
      const list = res?.data || res || [];
      const ctaBlock = list.find(b => b.slug === 'cta');
      if (!ctaBlock) {
        adminService.createHomeBlock({
          slug: 'cta',
          layout: 'split',
          title: "Votre Prochaine\nPaire Vous Attend.",
          label: "Collection 2025",
          description: "Explorer la boutique",
          bullets: ["/catalog", "50", "60", "false", "50", "60", "cover"],
          is_active: true,
          sort_order: 99
        }).then(newBlock => {
          const b = newBlock?.data || newBlock;
          setBlock(b);
          setDraft(b);
        });
      } else {
        setBlock(ctaBlock);
        setDraft(ctaBlock);
      }
    }).catch(() => {
      setError('Erreur lors du chargement de la section CTA.');
    }).finally(() => setLoading(false));
  }, [setError]);

  const updateField = (key, value) => {
    setDraft(prev => prev ? { ...prev, [key]: value } : null);
  };

  const updateBulletsField = (index, value) => {
    setDraft(prev => {
      if (!prev) return null;
      const newBullets = [...(prev.bullets || [])];
      while (newBullets.length <= index) {
        newBullets.push('');
      }
      newBullets[index] = String(value);
      return { ...prev, bullets: newBullets };
    });
  };

  const onSave = async () => {
    if (!draft) return;
    setSavingDraft(true);
    try {
      await adminService.updateHomeBlock(draft.id, draft);
      setBlock(draft);
      setSuccess('Modifications enregistrées avec succès.');
    } catch (e) {
      setError('Erreur lors de la sauvegarde.');
    } finally {
      setSavingDraft(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !draft) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await adminService.uploadHomeBlockImage(draft.id, fd);
      const updated = res?.data || res;
      setDraft(prev => ({ ...prev, image_url: updated.image_url }));
      setBlock(prev => ({ ...prev, image_url: updated.image_url }));
      setSuccess('Image de fond mise à jour.');
    } catch (err) {
      setError('Erreur lors de l\'upload de l\'image.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  if (loading) return <div className="py-16 text-center text-neutral-400 text-xs uppercase tracking-widest animate-pulse">Chargement…</div>;
  if (!draft) return null;

  return (
    <TwoCol
      preview={<CTAPreview block={draft}/>}
      form={
        <>
          <FormBlock title="Statut & Image">
            <Toggle label="Activer le bandeau CTA sur le site" value={draft.is_active !== false} onChange={v => updateField('is_active', v)}/>
            
            {draft.image_url && (
              <div className="relative w-full h-36 bg-neutral-100 border border-neutral-200 mb-3 overflow-hidden group">
                <img src={draft.image_url} alt="CTA Background" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <p className="text-white text-[10px] font-bold uppercase tracking-wider">Image de fond actuelle</p>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2 mt-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Modifier l'image</label>
              <div className="relative border-2 border-dashed border-neutral-300 hover:border-neutral-500 bg-neutral-50 cursor-pointer p-6 flex flex-col items-center justify-center gap-2" onClick={() => !uploading && fileRef.current?.click()}>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                {uploading ? (
                  <div className="flex flex-col items-center gap-1.5">
                    <Loader2 className="w-5 h-5 text-accent animate-spin" />
                    <span className="text-[9px] font-bold text-neutral-400">Upload de l'image...</span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-5 h-5 text-neutral-400"/>
                    <p className="text-[11px] font-bold text-neutral-600">
                      {draft.image_url ? "Remplacer l'image de fond" : "Cliquez pour modifier l'image de fond"}
                    </p>
                  </>
                )}
              </div>
            </div>
          </FormBlock>

          <FormBlock title="Ajustement de l'image & Style">
            {/* Banner Height Slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Hauteur de la section (Taille)</label>
                <span className="text-[10px] font-black text-neutral-600">
                  {(() => {
                    const val = draft.bullets?.[5] || '60';
                    if (val === 'small') return '40vh (Petite)';
                    if (val === 'medium') return '60vh (Moyenne)';
                    if (val === 'large') return '80vh (Grande)';
                    if (val === 'full') return '100vh (Plein Écran)';
                    return `${val}vh`;
                  })()}
                </span>
              </div>
              <input
                type="range"
                min="30"
                max="100"
                step="5"
                value={(() => {
                  const val = draft.bullets?.[5] || '60';
                  if (val === 'small') return 40;
                  if (val === 'medium') return 60;
                  if (val === 'large') return 80;
                  if (val === 'full') return 100;
                  return Number(val);
                })()}
                onChange={e => updateBulletsField(5, e.target.value)}
                className="premium-range"
              />
            </div>

            {/* Sizing / Fit mode */}
            <div className="flex flex-col gap-1.5 mt-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Mode d'ajustement (Remplissage)</label>
              <div className="flex gap-2">
                {[
                  ['cover', 'Remplir'],
                  ['contain', 'Adapter']
                ].map(([val, label]) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => updateBulletsField(6, val)}
                    className={`flex-1 py-2 text-[10px] font-bold uppercase border transition-colors ${
                      (draft.bullets?.[6] || 'cover') === val
                        ? 'bg-neutral-900 text-white border-neutral-900'
                        : 'border-neutral-300 text-neutral-500 hover:border-neutral-700 bg-white'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Vertical Position Slider */}
            <div className="flex flex-col gap-1.5 mt-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Positionnement vertical</label>
                <span className="text-[10px] font-black text-neutral-600">
                  {(() => {
                    const val = draft.bullets?.[1] || '50';
                    if (val === 'top') return '0% (Haut)';
                    if (val === 'center') return '50% (Milieu)';
                    if (val === 'bottom') return '100% (Bas)';
                    return `${val}%`;
                  })()}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={(() => {
                  const val = draft.bullets?.[1] || '50';
                  if (val === 'top') return 0;
                  if (val === 'center') return 50;
                  if (val === 'bottom') return 100;
                  return Number(val);
                })()}
                onChange={e => updateBulletsField(1, e.target.value)}
                className="premium-range"
              />
            </div>

            {/* Horizontal Position Slider */}
            <div className="flex flex-col gap-1.5 mt-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Positionnement horizontal</label>
                <span className="text-[10px] font-black text-neutral-600">
                  {(() => {
                    const val = draft.bullets?.[4] || '50';
                    if (val === 'left') return '0% (Gauche)';
                    if (val === 'center') return '50% (Milieu)';
                    if (val === 'right') return '100% (Droite)';
                    return `${val}%`;
                  })()}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={(() => {
                  const val = draft.bullets?.[4] || '50';
                  if (val === 'left') return 0;
                  if (val === 'center') return 50;
                  if (val === 'right') return 100;
                  return Number(val);
                })()}
                onChange={e => updateBulletsField(4, e.target.value)}
                className="premium-range"
              />
            </div>

            {/* Opacity Slider */}
            <div className="flex flex-col gap-1.5 mt-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Opacité du voile noir</label>
                <span className="text-[10px] font-black text-neutral-600">{(draft.bullets?.[2] || '60')}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="90"
                step="5"
                value={Number(draft.bullets?.[2] || '60')}
                onChange={e => updateBulletsField(2, e.target.value)}
                className="premium-range"
              />
              <p className="text-[9px] text-neutral-400 text-left">Permet de rendre l'image plus sombre pour faire ressortir le texte blanc.</p>
            </div>

            {/* Parallax Toggle */}
            <div className="flex flex-col gap-1.5 mt-4 pt-4 border-t border-neutral-100">
              <Toggle 
                label="Effet parallaxe au défilement (image fixe)" 
                value={draft.bullets?.[3] === 'true'} 
                onChange={v => updateBulletsField(3, v ? 'true' : 'false')}
              />
              <p className="text-[9px] text-neutral-400 text-left">Fixe l'image de fond lors du défilement de la page pour un effet de profondeur premium.</p>
            </div>
          </FormBlock>

          <FormBlock title="Textes">
            <Field label="Sous-titre (accroche dorée)" value={draft.label} onChange={v => updateField('label', v)} placeholder="Collection 2025"/>
            <Textarea label="Titre principal (\n pour saut de ligne)" value={draft.title} onChange={v => updateField('title', v)} rows={2}/>
          </FormBlock>

          <FormBlock title="Bouton d'action">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Texte du bouton" value={draft.description} onChange={v => updateField('description', v)} placeholder="Explorer la boutique"/>
              <Field label="Lien du bouton" value={draft.bullets?.[0] || ''} onChange={v => updateBulletsField(0, v)} placeholder="/catalog"/>
            </div>
          </FormBlock>

          <div className="mt-6 pt-4 border-t border-neutral-200 flex justify-end">
            <button
              type="button"
              onClick={onSave}
              disabled={savingDraft}
              className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-widest transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {savingDraft ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Enregistrement...
                </>
              ) : (
                'Enregistrer'
              )}
            </button>
          </div>
        </>
      }
    />
  );
};

// ══════════════════════════════════════════════════════════════════════════
//  4. PARAMÈTRES DU FOOTER
// ══════════════════════════════════════════════════════════════════════════
const FooterPreviewLocal = ({settings}) => {
  return (
    <footer className="bg-neutral-950 text-white py-12 px-6">
      <div className="max-w-md mx-auto flex flex-col gap-6 text-center">
        <div>
          <h2 className="text-sm font-black tracking-widest uppercase mb-2">HA-KAVOD 97</h2>
          <p className="text-[11px] text-neutral-400 leading-relaxed">{settings.description || "Maison de mode de luxe."}</p>
        </div>
        <div className="w-12 h-px bg-neutral-800 mx-auto" />
        <div className="flex flex-col gap-2 items-center text-[11px] text-neutral-300">
          {settings.phone && <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-accent"/> {settings.phone}</p>}
          {settings.email && <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-accent"/> {settings.email}</p>}
          {settings.default_country_code && <p className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-accent"/> Pays : {settings.default_country_code}</p>}
        </div>
        <div className="flex justify-center gap-3 mt-2 flex-wrap">
          {[['whatsapp_url', 'WhatsApp'], ['facebook_url', 'Facebook'], ['instagram_url', 'Instagram'], ['tiktok_url', 'TikTok']].map(([k, name]) => {
            if (!settings[k]) return null;
            return (
              <span key={k} className="text-[9px] uppercase tracking-widest border border-neutral-700 px-3 py-1.5 text-neutral-400">
                {name}
              </span>
            );
          })}
        </div>
      </div>
    </footer>
  );
};

const FooterEditor = ({isDarkMode, setSuccess, setError}) => {
  const [settings, setSettings] = useState({
    description: '', phone: '', email: '', default_country_code: 'CI',
    whatsapp_url: '', facebook_url: '', instagram_url: '', tiktok_url: '', twitter_url: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminService.getFooterSettings().then(res => {
      const data = res?.data || res || {};
      setSettings({
        description: data.description || '',
        phone: data.phone || '',
        email: data.email || '',
        default_country_code: data.default_country_code || 'CI',
        whatsapp_url: data.whatsapp_url || '',
        facebook_url: data.facebook_url || '',
        instagram_url: data.instagram_url || '',
        tiktok_url: data.tiktok_url || '',
        twitter_url: data.twitter_url || ''
      });
    }).catch(() => {
      setError('Erreur lors du chargement des paramètres du footer.');
    }).finally(() => setLoading(false));
  }, [setError]);

  const upd = (f, v) => setSettings(p => ({ ...p, [f]: v }));

  const save = async () => {
    setSaving(true);
    try {
      await adminService.updateFooterSettings(settings);
      setSuccess('Paramètres du footer enregistrés avec succès.');
    } catch (e) {
      setError('Erreur de sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-16 text-center text-neutral-400 text-xs uppercase tracking-widest animate-pulse">Chargement…</div>;

  return (
    <TwoCol
      preview={<FooterPreviewLocal settings={settings}/>}
      form={
        <>
          <FormBlock title="Contacts du Footer">
            <Textarea label="Présentation courte de la maison (Footer)" value={settings.description} onChange={v => upd('description', v)} rows={3}/>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Téléphone de contact" value={settings.phone} onChange={v => upd('phone', v)} placeholder="+225 07 20 710 359"/>
              <Field label="E-mail public" value={settings.email} onChange={v => upd('email', v)} placeholder="contact@hakavok.com"/>
            </div>
            <Field label="Code Pays par défaut (ex: CI)" value={settings.default_country_code} onChange={v => upd('default_country_code', v)}/>
          </FormBlock>

          <FormBlock title="Réseaux Sociaux">
            <Field label="Lien WhatsApp" value={settings.whatsapp_url} onChange={v => upd('whatsapp_url', v)} placeholder="https://wa.me/..."/>
            <Field label="Lien Instagram" value={settings.instagram_url} onChange={v => upd('instagram_url', v)} placeholder="https://instagram.com/..."/>
            <Field label="Lien Facebook" value={settings.facebook_url} onChange={v => upd('facebook_url', v)} placeholder="https://facebook.com/..."/>
            <Field label="Lien TikTok" value={settings.tiktok_url} onChange={v => upd('tiktok_url', v)} placeholder="https://tiktok.com/..."/>
          </FormBlock>

          <div className="flex justify-end">
            <button type="button" onClick={save} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-accent text-neutral-900 text-[10px] font-black uppercase tracking-widest hover:bg-accent/80 disabled:opacity-50 transition-colors">
              <Save className="w-3.5 h-3.5"/> {saving?'Sauvegarde…':'Sauvegarder les paramètres'}
            </button>
          </div>
        </>
      }
    />
  );
};

// ══════════════════════════════════════════════════════════════════════════
// COMPOSANT CENTRAL
// ══════════════════════════════════════════════════════════════════════════
const SECTIONS = [
  { key:'hero', label:'Diaporama (Haut)', sublabel:'Bannières plein écran (Hero)', icon:MonitorPlay, color:'bg-neutral-950' },
  { key:'middle', label:'Carrousel Produits (Milieu)', sublabel:'Diaporama de produits (milieu de page)', icon:Layout, color:'bg-stone-800' },
  { key:'promo', label:'Sections produits à la une', sublabel:'Associer et ordonner des produits du catalogue', icon:Layers, color:'bg-neutral-900' },
  { key:'menu_banners', label:'Méga Menu (Bannières)', sublabel:'Bannière promo dans l\'encart droit du menu', icon:LayoutTemplate, color:'bg-blue-900' },
  { key:'craft', label:'Bloc Artisanat / Savoir-Faire', sublabel:'Titre, description et points clés savoir-faire', icon:Wrench, color:'bg-stone-700' },
  { key:'cta', label:'Bandeau CTA', sublabel:'Titre, bouton et image de fond lifestyle final', icon:Megaphone, color:'bg-amber-700' },
  { key:'footer', label:'Paramètres du Footer', sublabel:'Coordonnées de contact et réseaux sociaux du bas', icon:Share2, color:'bg-neutral-800' },
];

const HomePageEditor = ({ isDarkMode, showConfirm, showAlert, setSuccess, setError }) => {
  const [section, setSection] = useState('hero');
  const cur = SECTIONS.find(s=>s.key===section);

  return (
    <div className="animate-fade-in flex flex-col gap-0">
      {/* Structure de la page d'accueil */}
      <div className={`mb-6 border rounded-none overflow-hidden ${isDarkMode?'border-neutral-700':'border-neutral-200'}`}>
        <div className={`flex items-center gap-3 px-5 py-3.5 border-b ${isDarkMode?'bg-neutral-800 border-neutral-700':'bg-neutral-50 border-neutral-200'}`}>
          <LayoutTemplate className="w-4 h-4 text-neutral-400"/>
          <div>
            <p className={`text-[11px] font-black uppercase tracking-widest ${isDarkMode?'text-white':'text-neutral-700'}`}>Éditeur de structure de site</p>
            <p className="text-[10px] text-neutral-400">Sélectionnez la section de la page d'accueil à gérer</p>
          </div>
        </div>

        <div className="flex divide-x divide-neutral-200">
          {SECTIONS.map(({key,label,sublabel,icon:Icon,color})=>(
            <button key={key} type="button" onClick={()=>setSection(key)}
              className={`flex-1 flex flex-col items-center gap-2 px-4 py-4 text-center transition-all ${section===key?(isDarkMode?'bg-neutral-800':'bg-white'):(isDarkMode?'hover:bg-neutral-800':'hover:bg-neutral-50')}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${section===key?color+' text-white':'bg-neutral-100 text-neutral-400'} transition-colors`}>
                <Icon className="w-4 h-4"/>
              </div>
              <div>
                <p className={`text-[11px] font-black uppercase tracking-wider transition-colors ${section===key?(isDarkMode?'text-white':'text-neutral-900'):'text-neutral-400'}`}>{label}</p>
                <p className="text-[9px] text-neutral-400 mt-0.5 hidden sm:block">{sublabel}</p>
              </div>
              {section===key && <div className="w-6 h-0.5 bg-accent"/>}
            </button>
          ))}
        </div>
      </div>

      {/* Titre section active */}
      <div className="flex items-center gap-3 mb-5">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${cur.color} text-white shrink-0`}>
          <cur.icon className="w-4 h-4"/>
        </div>
        <div>
          <h2 className={`text-sm font-black uppercase tracking-widest ${isDarkMode?'text-white':'text-neutral-900'}`}>{cur.label}</h2>
          <p className="text-[10px] text-neutral-400">{cur.sublabel}</p>
        </div>
      </div>

      {/* Rendu des éditeurs spécifiques */}
      {section==='hero' && (
        <HeroSlides 
          isDarkMode={isDarkMode} 
          showConfirm={showConfirm} 
          showAlert={showAlert} 
          setSuccess={setSuccess} 
          setError={setError} 
          initialSection="top" 
          hideTabs={true} 
        />
      )}
      {section==='middle' && (
        <HeroSlides 
          isDarkMode={isDarkMode} 
          showConfirm={showConfirm} 
          showAlert={showAlert} 
          setSuccess={setSuccess} 
          setError={setError} 
          initialSection="middle" 
          hideTabs={true} 
        />
      )}
      {section==='menu_banners' && (
        <HeroSlides 
          isDarkMode={isDarkMode} 
          showConfirm={showConfirm} 
          showAlert={showAlert} 
          setSuccess={setSuccess} 
          setError={setError} 
          initialSection="menu_banners" 
          hideTabs={true} 
        />
      )}
      {section==='promo' && <PromoEditor isDarkMode={isDarkMode} setSuccess={setSuccess} setError={setError}/>}
      {section==='craft' && <CraftEditor isDarkMode={isDarkMode} setSuccess={setSuccess} setError={setError}/>}
      {section==='cta' && <CTAEditor isDarkMode={isDarkMode} setSuccess={setSuccess} setError={setError}/>}
      {section==='footer' && <FooterEditor isDarkMode={isDarkMode} setSuccess={setSuccess} setError={setError}/>}
    </div>
  );
};

export default HomePageEditor;
