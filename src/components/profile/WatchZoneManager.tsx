"use client";

import { useState } from "react";
import { EVENT_CATEGORIES, CATEGORY_META } from "@/lib/map/categories";
import {
  createWatchZoneAction,
  deleteWatchZoneAction,
  toggleWatchZonePausedAction,
  updateWatchZoneAction,
} from "@/lib/actions/watchZones";
import { SEVERITY_LEVELS } from "@/lib/watchZones/validation";
import authStyles from "@/components/auth/AuthForm.module.css";
import profileStyles from "./Profile.module.css";
import styles from "./WatchZoneManager.module.css";

export interface WatchZoneData {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
  radiusKm: number;
  categories: string[];
  minSeverity: string;
  notificationsEnabled: boolean;
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
  paused: boolean;
}

interface WatchZoneManagerProps {
  zones: WatchZoneData[];
}

const EMPTY_FORM = {
  label: "",
  latitude: "",
  longitude: "",
  radiusKm: "25",
  categories: [] as string[],
  minSeverity: "advisory" as string,
  notificationsEnabled: true,
  quietHoursStart: "",
  quietHoursEnd: "",
};

export function WatchZoneManager({ zones }: WatchZoneManagerProps) {
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className={profileStyles.section}>
      <h2 className={profileStyles.sectionTitle}>Watch Zones</h2>
      <p className={styles.geoNote}>
        Shown as a list and as plain point markers on the globe — not a drawn radius, since
        dynamic vector map data is currently gated (see docs/investigations/MAPLIBRE-GEOJSON.md).
      </p>

      {zones.length === 0 && !creating && (
        <p className={profileStyles.emptyState}>No Watch Zones yet.</p>
      )}

      <ul className={styles.list}>
        {zones.map((zone) =>
          editingId === zone.id ? (
            <li key={zone.id} className={styles.zoneCard}>
              <WatchZoneForm
                initial={zone}
                onCancel={() => setEditingId(null)}
                onSubmit={async (input) => {
                  const result = await updateWatchZoneAction(zone.id, input);
                  if (result.ok) setEditingId(null);
                  return result;
                }}
              />
            </li>
          ) : (
            <li key={zone.id} className={styles.zoneCard}>
              <div className={styles.zoneHeader}>
                <p className={styles.zoneLabel}>{zone.label}</p>
                <div className={styles.zoneActions}>
                  <button
                    type="button"
                    className={styles.iconButton}
                    onClick={() => toggleWatchZonePausedAction(zone.id, !zone.paused)}
                  >
                    {zone.paused ? "Resume" : "Pause"}
                  </button>
                  <button type="button" className={styles.iconButton} onClick={() => setEditingId(zone.id)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className={styles.iconButton}
                    onClick={() => {
                      if (confirm(`Delete "${zone.label}"?`)) void deleteWatchZoneAction(zone.id);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p className={styles.zoneMeta}>
                {zone.latitude.toFixed(2)}, {zone.longitude.toFixed(2)} — {zone.radiusKm} km radius —
                min severity: {zone.minSeverity}
                {zone.paused ? " — paused" : ""}
              </p>
              <div className={styles.zoneCategories}>
                {zone.categories.map((c) => (
                  <span key={c} className={styles.categoryChip}>
                    {CATEGORY_META[c as keyof typeof CATEGORY_META]?.label ?? c}
                  </span>
                ))}
              </div>
            </li>
          ),
        )}
      </ul>

      {creating ? (
        <div className={styles.zoneCard}>
          <WatchZoneForm
            initial={null}
            onCancel={() => setCreating(false)}
            onSubmit={async (input) => {
              const result = await createWatchZoneAction(input);
              if (result.ok) setCreating(false);
              return result;
            }}
          />
        </div>
      ) : (
        <button type="button" className={profileStyles.primaryButton} onClick={() => setCreating(true)}>
          Create Watch Zone
        </button>
      )}
    </div>
  );
}

interface WatchZoneFormProps {
  initial: WatchZoneData | null;
  onCancel: () => void;
  onSubmit: (input: Record<string, unknown>) => Promise<{ ok: boolean; errors?: Record<string, string> }>;
}

function WatchZoneForm({ initial, onCancel, onSubmit }: WatchZoneFormProps) {
  const [form, setForm] = useState(
    initial
      ? {
          label: initial.label,
          latitude: String(initial.latitude),
          longitude: String(initial.longitude),
          radiusKm: String(initial.radiusKm),
          categories: initial.categories,
          minSeverity: initial.minSeverity,
          notificationsEnabled: initial.notificationsEnabled,
          quietHoursStart: initial.quietHoursStart ?? "",
          quietHoursEnd: initial.quietHoursEnd ?? "",
        }
      : EMPTY_FORM,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [geoStatus, setGeoStatus] = useState<string | null>(null);

  function toggleCategory(category: string) {
    setForm((f) => ({
      ...f,
      categories: f.categories.includes(category)
        ? f.categories.filter((c) => c !== category)
        : [...f.categories, category],
    }));
  }

  function useCurrentLocation() {
    if (!("geolocation" in navigator)) {
      setGeoStatus("Location isn't available in this browser.");
      return;
    }
    setGeoStatus("Locating…");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((f) => ({
          ...f,
          latitude: String(position.coords.latitude.toFixed(4)),
          longitude: String(position.coords.longitude.toFixed(4)),
        }));
        setGeoStatus(null);
      },
      () => setGeoStatus("Couldn't get your location — enter coordinates manually."),
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const result = await onSubmit(form);
    setSubmitting(false);
    if (!result.ok && result.errors) setErrors(result.errors);
  }

  return (
    <form className={authStyles.form} onSubmit={handleSubmit} noValidate>
      <div className={authStyles.field}>
        <label className={authStyles.label} htmlFor="zone-label">
          Name
        </label>
        <input
          id="zone-label"
          className={authStyles.input}
          value={form.label}
          onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
          placeholder="Home, Family, Work…"
        />
        {errors["label"] && <p className={authStyles.error}>{errors["label"]}</p>}
      </div>

      <div className={styles.grid}>
        <div className={authStyles.field}>
          <label className={authStyles.label} htmlFor="zone-lat">
            Latitude
          </label>
          <input
            id="zone-lat"
            className={authStyles.input}
            inputMode="decimal"
            value={form.latitude}
            onChange={(e) => setForm((f) => ({ ...f, latitude: e.target.value }))}
          />
          {errors["latitude"] && <p className={authStyles.error}>{errors["latitude"]}</p>}
        </div>
        <div className={authStyles.field}>
          <label className={authStyles.label} htmlFor="zone-lon">
            Longitude
          </label>
          <input
            id="zone-lon"
            className={authStyles.input}
            inputMode="decimal"
            value={form.longitude}
            onChange={(e) => setForm((f) => ({ ...f, longitude: e.target.value }))}
          />
          {errors["longitude"] && <p className={authStyles.error}>{errors["longitude"]}</p>}
        </div>
      </div>
      <button type="button" className={styles.iconButton} onClick={useCurrentLocation}>
        Use current location
      </button>
      {geoStatus && <p className={styles.geoNote}>{geoStatus}</p>}

      <div className={authStyles.field}>
        <label className={authStyles.label} htmlFor="zone-radius">
          Radius (km)
        </label>
        <input
          id="zone-radius"
          className={authStyles.input}
          type="number"
          min={1}
          max={500}
          value={form.radiusKm}
          onChange={(e) => setForm((f) => ({ ...f, radiusKm: e.target.value }))}
        />
        {errors["radiusKm"] && <p className={authStyles.error}>{errors["radiusKm"]}</p>}
      </div>

      <fieldset className={authStyles.field}>
        <legend className={authStyles.label}>Categories</legend>
        <div className={styles.checkboxRow}>
          {EVENT_CATEGORIES.map((category) => (
            <label key={category} className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={form.categories.includes(category)}
                onChange={() => toggleCategory(category)}
              />
              {CATEGORY_META[category].label}
            </label>
          ))}
        </div>
        {errors["categories"] && <p className={authStyles.error}>{errors["categories"]}</p>}
      </fieldset>

      <div className={authStyles.field}>
        <label className={authStyles.label} htmlFor="zone-severity">
          Minimum severity
        </label>
        <select
          id="zone-severity"
          className={authStyles.input}
          value={form.minSeverity}
          onChange={(e) => setForm((f) => ({ ...f, minSeverity: e.target.value }))}
        >
          {SEVERITY_LEVELS.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      </div>

      <label className={styles.checkboxLabel}>
        <input
          type="checkbox"
          checked={form.notificationsEnabled}
          onChange={(e) => setForm((f) => ({ ...f, notificationsEnabled: e.target.checked }))}
        />
        Notifications enabled
      </label>

      <div className={styles.grid}>
        <div className={authStyles.field}>
          <label className={authStyles.label} htmlFor="zone-quiet-start">
            Quiet hours start
          </label>
          <input
            id="zone-quiet-start"
            className={authStyles.input}
            type="time"
            value={form.quietHoursStart}
            onChange={(e) => setForm((f) => ({ ...f, quietHoursStart: e.target.value }))}
          />
        </div>
        <div className={authStyles.field}>
          <label className={authStyles.label} htmlFor="zone-quiet-end">
            Quiet hours end
          </label>
          <input
            id="zone-quiet-end"
            className={authStyles.input}
            type="time"
            value={form.quietHoursEnd}
            onChange={(e) => setForm((f) => ({ ...f, quietHoursEnd: e.target.value }))}
          />
        </div>
      </div>

      <div className={profileStyles.actions}>
        <button type="submit" className={profileStyles.primaryButton} disabled={submitting}>
          {submitting ? "Saving…" : "Save Watch Zone"}
        </button>
        <button type="button" className={profileStyles.secondaryButton} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
