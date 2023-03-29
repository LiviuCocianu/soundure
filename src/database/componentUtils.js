import db from "./database";
import { trackSet } from "../redux/slices/trackSlice";
import Toast from "react-native-root-toast";


export const TrackUtils = {
    toggleFavorite: (trackId, dispatch) => {
        db.selectFrom("Track", null, "id=?", [trackId]).then(rows => {
            const track = rows[0];

            db.update("Track", "favorite=?", "id=?", [!track.favorite, track.id]).then(() => {
                dispatch(trackSet({...track, favorite: !track.favorite}));
            });
    
            if(!track.favorite) {
                Toast.show("Piesă adaugată la favorite!");
            } else {
                Toast.show("Piesă eliminată de la favorite!");
            }
        });
    }
}