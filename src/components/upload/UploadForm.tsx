"use client";

import { useState } from "react";
import { EVENT_CATEGORIES, CATEGORY_META } from "@/lib/map/categories";
import { createReportAction } from "@/lib/actions/upload";
import authStyles from "@/components/auth/AuthForm.module.css";
import styles from "./UploadForm.module.css";

export function UploadForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [published, setPublished] = useState(false);
  const [geoStatus, setGeoStatus] = useState<string | null>(null);
  const [coords, setCoords] = useState({ latitude: "", longitude: "" });

  function useCurrentLocation() {
    if (!("geolocation" in navigator)) {
      setGeoStatus("Location isn't available in this browser — enter it manually.");
      return;
    }
    setGeoStatus("Locating…");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude.toFixed(2),
          longitude: position.coords.longitude.toFixed(2),
        });
        setGeoStatus("Location captured — public precision is reduced automatically.");
      },
      () => setGeoStatus("Couldn't get your location — enter it manually."),
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Capture the form element itself, not the SyntheticEvent -- React
    // nulls out e.currentTarget once the handler yields past an await, so
    // using it after the `await createReportAction` below throws
    // "Cannot read properties of null (reading 'reset')" (caught live in
    // CI: an unhandled rejection on every successful submit).
    const form = e.currentTarget;
    setErrors({});
    setSubmitting(true);
    const formData = new FormData(form);
    const result = await createReportAction(formData);
    setSubmitting(false);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setPublished(true);
    form.reset();
  }

  return (
    <div className={styles.wrap}>
      <h1 className={styles.title}>Upload a weather report</h1>
      <p className={styles.notice}>
        Weather-only content, please — see the product boundary. Your public location is reduced
        to roughly locality precision; the exact point you enter is never published.
      </p>

      {published && <p className={styles.status}>Report published.</p>}

      <form className={authStyles.form} onSubmit={handleSubmit} noValidate>
        <div className={authStyles.field}>
          <label className={authStyles.label} htmlFor="file">
            Video
          </label>
          <input id="file" name="file" type="file" accept="video/mp4,video/webm,video/quicktime" required />
          {errors["file"] && <p className={authStyles.error}>{errors["file"]}</p>}
        </div>

        <div className={authStyles.field}>
          <label className={authStyles.label} htmlFor="category">
            Weather category
          </label>
          <select id="category" name="category" className={authStyles.input} defaultValue="">
            <option value="" disabled>
              Choose a category
            </option>
            {EVENT_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {CATEGORY_META[category].label}
              </option>
            ))}
          </select>
          {errors["category"] && <p className={authStyles.error}>{errors["category"]}</p>}
        </div>

        <div className={authStyles.field}>
          <label className={authStyles.label} htmlFor="caption">
            Caption
          </label>
          <input id="caption" name="caption" className={authStyles.input} maxLength={220} required />
          {errors["caption"] && <p className={authStyles.error}>{errors["caption"]}</p>}
        </div>

        <div className={authStyles.field}>
          <label className={authStyles.label} htmlFor="locationLabel">
            Location label
          </label>
          <input id="locationLabel" name="locationLabel" className={authStyles.input} required />
          {errors["locationLabel"] && <p className={authStyles.error}>{errors["locationLabel"]}</p>}
        </div>

        <div className={authStyles.field}>
          <label className={authStyles.label} htmlFor="latitude">
            Latitude
          </label>
          <input
            id="latitude"
            name="latitude"
            className={authStyles.input}
            inputMode="decimal"
            value={coords.latitude}
            onChange={(e) => setCoords((c) => ({ ...c, latitude: e.target.value }))}
            required
          />
          {errors["latitude"] && <p className={authStyles.error}>{errors["latitude"]}</p>}
        </div>
        <div className={authStyles.field}>
          <label className={authStyles.label} htmlFor="longitude">
            Longitude
          </label>
          <input
            id="longitude"
            name="longitude"
            className={authStyles.input}
            inputMode="decimal"
            value={coords.longitude}
            onChange={(e) => setCoords((c) => ({ ...c, longitude: e.target.value }))}
            required
          />
          {errors["longitude"] && <p className={authStyles.error}>{errors["longitude"]}</p>}
        </div>
        <button type="button" className={authStyles.switchLink} onClick={useCurrentLocation}>
          Use current location
        </button>
        {geoStatus && <p className={styles.notice}>{geoStatus}</p>}

        <button type="submit" className={authStyles.submit} disabled={submitting}>
          {submitting ? "Uploading…" : "Publish report"}
        </button>
      </form>
    </div>
  );
}
