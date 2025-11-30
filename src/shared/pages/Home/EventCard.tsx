import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { categoryTranslate, statusTranslate, categoryTypeTranslate } from "../../../modules/event/utils/eventTranslate";
import "./css/EventCard.css";
import defaultImage from "../../../assets/default-image.webp";
import { useState, useRef, useEffect } from "react";
import StatusChange from "../../../modules/event/pages/updateStatus/StatusChange";
import { getEventMetrics } from "../../../modules/event/api/eventApi";
import { parseJwt } from "../../../modules/auth/api/authApi";

type Event = {
  eventId: string;
  venueId: string;
  name: string;
  category: string;
  categoryType: string;
  status: string;
  time: string;
  address: string;
  thumbnailUrl?: string | null;
};

export default function EventCard({ event, showMenu = false }: { event: Event; showMenu?: boolean }) {
  const navigate = useNavigate();

  const utcDate = new Date(event.time);
  const dateUTC3 = new Date(utcDate.getTime() - 3 * 60 * 60 * 1000);
  const dateStr = format(dateUTC3, "dd/MM/yyyy HH:mm");

  const hasThumbnail = Boolean(event.thumbnailUrl && event.thumbnailUrl.trim());

  const [menuOpen, setMenuOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(event.status);

  const [isSoldOut, setIsSoldOut] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  const goToEventPreview = () => {
    if (showMenu) navigate(`/event/${event.eventId}/metrics`);
    else navigate(`/event/${event.eventId}`);
  };

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const data = await getEventMetrics(event.eventId);
        if (data?.ocupancyRate === 100) {
          setIsSoldOut(true);
        }
      } catch (err) {
        console.error("Error cargando métricas del evento", err);
      }
    };

    loadMetrics();
  }, [event.eventId]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setStatusOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <article className="event-card-general">
      {showMenu && (
        <div className="event-card-menu" ref={menuRef}>
          <button
            className="menu-button"
            onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
          >
            ⋮
          </button>

          {menuOpen && (
            <div className="menu-dropdown">
              <button
                onClick={() => navigate(`/event/${event.eventId}/update`)}
                disabled={currentStatus === "Finished"}
                className={`px-3 py-1 rounded text-white ${
                  currentStatus === "Finished"
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-500"
                }`}
              >
                Editar
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (currentStatus !== "Finished") setStatusOpen(!statusOpen);
                }}
                disabled={currentStatus === "Finished"}
              >
                Actualizar estado
              </button>

              {statusOpen && (
                <StatusChange
                  eventId={event.eventId}
                  currentStatus={currentStatus}
                  eventDate={event.time}
                  onChange={(newStatus) => {
                    setCurrentStatus(newStatus);
                    setStatusOpen(false);
                    setMenuOpen(false);
                  }}                />
              )}
            </div>
          )}
        </div>
      )}

      <div className="event-card" role="button" tabIndex={0}>
        <div className="event-card-image-wrapper" onClick={goToEventPreview}>
          <img
            src={hasThumbnail ? event.thumbnailUrl! : defaultImage}
            alt={event.name}
            className="event-card-image"
            loading="lazy"
          />
        </div>

        <div className="event-card-content" onClick={goToEventPreview}>
          <div className="event-card-date-tittle">
            <p className="event-card-date">{dateStr}</p>
            <h3 className="event-card-title">{event.name}</h3>
          </div>

          <div className="event-card-category-status gap-2 items-center">
            <p className="event-card-category">
              {categoryTranslate[event.category] ?? event.category}
              {" · "}
              {categoryTypeTranslate[event.categoryType] ?? event.categoryType}
            </p>

            <div className="event-card-status-page">
              <p className="event-card-status">
                {statusTranslate[currentStatus] ?? currentStatus}
              </p>

              {isSoldOut && (
                <span className="event-card-status sold-out text-xs">
                  Entradas agotadas
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
