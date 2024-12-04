import { library, dom } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { fas } from '@fortawesome/free-solid-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { faPhone } from "@fortawesome/free-solid-svg-icons";
library.add(fas, far, fab, faPhone)
dom.watch();

export default FontAwesomeIcon;
