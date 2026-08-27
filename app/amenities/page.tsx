"use client";

import { ChangeEvent, DragEvent, useEffect, useState } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "../../lib/supabase-browser";
import PublicNav from "../components/public-nav";

type AmenityImage = { id: string; title: string; image_url: string; created_at: string };

export default function AmenitiesPage() {
  const [images, setImages] = useState<AmenityImage[]>([]);
  const [activeImage, setActiveImage] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [title, setTitle] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    let isMounted = true;

    supabase.from("amenity_images").select("id, title, image_url, created_at").order("created_at", { ascending: false }).then(({ data }) => {
      if (isMounted) setImages((data ?? []) as AmenityImage[]);
    });
    supabase.auth.getUser().then(({ data }) => {
      if (!isMounted) return;
      setUser(data.user);
      setIsAdmin(data.user?.app_metadata?.role === "admin");
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsAdmin(session?.user?.app_metadata?.role === "admin");
    });
    return () => { isMounted = false; listener.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (images.length < 2) return;
    const timer = window.setInterval(() => setActiveImage((current) => (current + 1) % images.length), 5000);
    return () => window.clearInterval(timer);
  }, [images.length]);

  function validateImage(file: File | undefined) {
    if (!file) return "Choose an image to upload.";
    if (!file.type.startsWith("image/")) return "Please upload a JPG, PNG, or WebP image.";
    if (file.size > 10 * 1024 * 1024) return "Images must be smaller than 10 MB.";
    return "";
  }

  async function uploadImage(file: File | undefined) {
    const validationError = validateImage(file);
    if (validationError || !file || !title.trim()) {
      setUploadError(validationError || "Add a title before uploading.");
      return;
    }
    setIsUploading(true);
    setUploadError("");
    const supabase = createSupabaseBrowserClient();
    const path = `${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
    const { error: storageError } = await supabase.storage.from("amenities-images").upload(path, file, { contentType: file.type, upsert: false });
    if (storageError) {
      setUploadError("The image could not be uploaded. Check the storage policies and try again.");
      setIsUploading(false);
      return;
    }
    const { data: publicUrl } = supabase.storage.from("amenities-images").getPublicUrl(path);
    const { data: newImage, error: databaseError } = await supabase.from("amenity_images").insert({ title: title.trim(), image_url: publicUrl.publicUrl }).select("id, title, image_url, created_at").single();
    if (databaseError) {
      await supabase.storage.from("amenities-images").remove([path]);
      setUploadError("The image uploaded but could not be added to the slideshow.");
    } else {
      setImages((current) => [newImage as AmenityImage, ...current]);
      setTitle("");
    }
    setIsUploading(false);
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
    void uploadImage(event.dataTransfer.files[0]);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    void uploadImage(event.target.files?.[0]);
    event.target.value = "";
  }

  const currentImage = images[activeImage];

  return (
    <main className="amenities-page">
      <section className="amenities-hero">
        <PublicNav current="amenities" />
        <div className="amenities-hero-content wrap"><p className="eyebrow light">Life outdoors · North Georgia</p><h1>Room to<br /><span>gather.</span></h1><p>Beautiful views, easy afternoons, and spaces made for being together.</p></div>
        {currentImage ? <div className="amenities-slide" style={{ backgroundImage: `url(${currentImage.image_url})` }} aria-label={currentImage.title} /> : <div className="amenities-slide amenities-placeholder" aria-label="Mountains and community amenities" />}
        {images.length > 0 && <div className="slide-controls" aria-label="Slideshow controls">{images.map((image, index) => <button className={index === activeImage ? "active" : ""} key={image.id} onClick={() => setActiveImage(index)} aria-label={`Show ${image.title}`} />)}</div>}
      </section>
      <section className="amenities-copy wrap"><div className="section-kicker"><span>01</span><span className="kicker-line" /><span>Gather here</span></div><div className="amenities-copy-grid"><h2>Made for<br /><i>mountain days.</i></h2><div><p>Teel Mountain Subdivision offers beautiful views of the north Georgia mountains and surrounding areas.</p><p>We have a private community pool where you can relax and have fun with family and friends.</p><p>Next to the pool is our covered pavilion which includes men’s and women’s restrooms, picnic tables, a bar area and fireplace. It’s a great place to entertain and enjoy the pool. Residents can reserve the pavilion for special events.</p><p>Our utilities are Habersham Electric, Windstream Communications and White County Water Authority.</p></div></div></section>
      {user && isAdmin && <section className="amenities-admin wrap"><div><span className="member-label">Admin tools</span><h2>Add slideshow images</h2><p>Use landscape images that are at least <strong>2400 × 1200 px</strong> with a 2:1 aspect ratio. This gives the responsive hero enough room to crop cleanly on desktop and mobile. JPG, PNG, or WebP files up to 10 MB.</p></div><div className="amenities-upload-fields"><label htmlFor="amenity-title">Image title<input id="amenity-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Community pool at sunset" /></label><label className={`amenities-dropzone${isDragging ? " is-dragging" : ""}`} onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={handleDrop}><input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} disabled={isUploading} /><strong>{isUploading ? "Uploading image..." : "Drop an image here or choose a file"}</strong><span>Landscape images work best</span></label>{uploadError && <p className="upload-error" role="alert">{uploadError}</p>}</div></section>}
      <footer className="footer"><div className="wrap footer-inner"><span>© 2026 Teel Mountain HOA</span><span>Made for mountain living <i>⌁</i></span><Link href="/">Back to home ↑</Link></div></footer>
    </main>
  );
}