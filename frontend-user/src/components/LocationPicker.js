import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Form, ListGroup, Card, Spinner } from 'react-bootstrap';
import { debounce } from 'lodash';

// Fix Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LocationMarker = ({ position, setPosition, reverseGeocode }) => {
    const map = useMap();

    useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng;
            setPosition([lat, lng]);
            reverseGeocode(lat, lng);
        },
    });

    useEffect(() => {
        if (position) {
            map.flyTo(position, map.getZoom());
        }
    }, [position, map]);

    return position === null ? null : (
        <Marker position={position} />
    );
};

const ChangeView = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);
    return null;
};

const LocationPicker = ({ value, onChange, isEditing = false }) => {
    const [searchQuery, setSearchQuery] = useState(value?.address || '');
    const [suggestions, setSuggestions] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [position, setPosition] = useState(value?.lat && value?.lng ? [value.lat, value.lng] : null);
    const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // Default center (India)
    const [zoom, setZoom] = useState(5);

    useEffect(() => {
        if (value?.lat && value?.lng) {
            setPosition([value.lat, value.lng]);
            setMapCenter([value.lat, value.lng]);
            setZoom(15);
            setSearchQuery(value.address || '');
        } else if (!isEditing) {
            // Try to get current location
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    setMapCenter([latitude, longitude]);
                    setZoom(13);
                },
                () => console.log('Geolocation permission denied')
            );
        }
    }, [isEditing, value?.lat, value?.lng, value?.address]);

    const handleSearch = debounce(async (query) => {
        if (query.length < 3) return;
        setIsSearching(true);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in`);
            const data = await response.json();
            setSuggestions(data);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setIsSearching(false);
        }
    }, 500);

    const selectLocation = (item) => {
        const lat = parseFloat(item.lat);
        const lon = parseFloat(item.lon);
        const pos = [lat, lon];
        setPosition(pos);
        setMapCenter(pos);
        setZoom(16);
        setSearchQuery(item.display_name);
        setSuggestions([]);
        onChange({
            lat,
            lng: lon,
            address: item.display_name
        });
    };

    const reverseGeocode = React.useCallback(async (lat, lng) => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await response.json();
            setSearchQuery(data.display_name);
            onChange({
                lat,
                lng,
                address: data.display_name
            });
        } catch (error) {
            console.error('Reverse geocode error:', error);
        }
    }, [onChange]);

    return (
        <Card className="location-picker-card mb-3 shadow-sm border-0">
            <Card.Body className="p-0">
                <div className="p-3 bg-light border-bottom">
                    <Form.Group className="position-relative mb-0">
                        <Form.Label className="fw-bold small text-muted text-uppercase mb-2">
                            <i className="bi bi-search me-2"></i>Search or click on the map to select issue location
                        </Form.Label>
                        <div className="input-group">
                            <Form.Control
                                type="text"
                                placeholder="Enter area, city or landmark..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    handleSearch(e.target.value);
                                }}
                                className="rounded-3 border-0 shadow-none bg-white py-2"
                            />
                            {isSearching && (
                                <span className="input-group-text bg-white border-0">
                                    <Spinner animation="border" size="sm" />
                                </span>
                            )}
                        </div>

                        {suggestions.length > 0 && (
                            <ListGroup className="position-absolute w-100 mt-1 shadow-lg" style={{ zIndex: 1100, maxHeight: '200px', overflowY: 'auto' }}>
                                {suggestions.map((item) => (
                                    <ListGroup.Item
                                        key={item.place_id}
                                        action
                                        onClick={() => selectLocation(item)}
                                        className="small py-2 border-0 border-bottom"
                                    >
                                        <i className="bi bi-geo-alt-fill text-danger me-2"></i>
                                        {item.display_name}
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        )}
                    </Form.Group>
                </div>

                <div style={{ height: '350px', width: '100%', position: 'relative' }}>
                    <MapContainer
                        center={mapCenter}
                        zoom={zoom}
                        scrollWheelZoom={true}
                        style={{ height: '100%', width: '100%', zIndex: 1 }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <LocationMarker
                            position={position}
                            setPosition={setPosition}
                            reverseGeocode={reverseGeocode}
                        />
                        <ChangeView center={mapCenter} zoom={zoom} />
                    </MapContainer>
                </div>

                {value?.lat && (
                    <div className="p-2 px-3 bg-white border-top small text-muted d-flex justify-content-between align-items-center">
                        <div>
                            <span className="fw-bold me-2">Lat:</span> {value.lat.toFixed(6)}
                            <span className="fw-bold ms-3 me-2">Lng:</span> {value.lng.toFixed(6)}
                        </div>
                        <div className="badge bg-primary-light text-primary rounded-pill px-3 py-2">
                            <i className="bi bi-check-circle-fill me-1"></i> Location Selected
                        </div>
                    </div>
                )}
            </Card.Body>
        </Card>
    );
};

export default LocationPicker;
