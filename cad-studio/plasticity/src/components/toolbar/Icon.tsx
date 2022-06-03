import { render } from 'preact';
import { Editor } from '../../editor/Editor';

export default (editor: Editor) => {
    class Icon extends HTMLElement {
        private _name!: string;
        get name() { return this._name }
        set name(name: string) { this._name = name }

        connectedCallback() { this.render() }
        render() {
            switch (this.name) {
                case 'minimize':
                    return render(
                        <svg class="w-3 h-3 stroke-2" stroke-width="1.5" viewBox='0 0 11 11'>
                            <path d='M11,4.9v1.1H0V4.399h11z' />
                        </svg>, this);
                case 'maximize':
                    return render(
                        <svg class="w-3 h-3 stroke-2" stroke-width="1.5" viewBox='0 0 11 11'>
                            <path d='M0,1.7v7.6C0,10.2,0.8,11,1.7,11h7.6c0.9,0,1.7-0.8,1.7-1.7V1.7C11,0.8,10.2,0,9.3,0H1.7C0.8,0,0,0.8,0,1.7z M8.8,9.9H2.2c-0.6,0-1.1-0.5-1.1-1.1V2.2c0-0.6,0.5-1.1,1.1-1.1h6.7c0.6,0,1.1,0.5,1.1,1.1v6.7C9.9,9.4,9.4,9.9,8.8,9.9z' />
                        </svg>, this);
                case 'close':
                    return render(
                        <svg class="w-3 h-3 stroke-2" stroke-width="1.5" viewBox='0 0 11 11'>
                            <path d='M6.279 5.5L11 10.221l-.779.779L5.5 6.279.779 11 0 10.221 4.721 5.5 0 .779.779 0 5.5 4.721 10.221 0 11 .779 6.279 5.5z' />
                        </svg>, this);
                case 'new':
                    return render(
                        <svg width="24" height="24" class="w-5 h-5 stroke-2" stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 12H12M15 12H12M12 12V9M12 12V15" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M4 21.4V2.6C4 2.26863 4.26863 2 4.6 2H16.2515C16.4106 2 16.5632 2.06321 16.6757 2.17574L19.8243 5.32426C19.9368 5.43679 20 5.5894 20 5.74853V21.4C20 21.7314 19.7314 22 19.4 22H4.6C4.26863 22 4 21.7314 4 21.4Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M16 5.4V2.35355C16 2.15829 16.1583 2 16.3536 2C16.4473 2 16.5372 2.03725 16.6036 2.10355L19.8964 5.39645C19.9628 5.46275 20 5.55268 20 5.64645C20 5.84171 19.8417 6 19.6464 6H16.6C16.2686 6 16 5.73137 16 5.4Z" fill="currentColor" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>, this);
                case 'save':
                    return render(
                        <svg width="24" height="24" class="w-5 h-5 stroke-2" stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 20.4V3.6C3 3.26863 3.26863 3 3.6 3H20.4C20.7314 3 21 3.26863 21 3.6V20.4C21 20.7314 20.7314 21 20.4 21H3.6C3.26863 21 3 20.7314 3 20.4Z" stroke="currentColor" stroke-width="1.5" />
                            <path d="M6 18L18 18" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M12 14V6M12 6L15.5 9.5M12 6L8.5 9.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>, this);
                case 'export':
                    return render(
                        <svg width="24" height="24" class="w-5 h-5 stroke-2" stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 19V5C3 3.89543 3.89543 3 5 3H16.1716C16.702 3 17.2107 3.21071 17.5858 3.58579L20.4142 6.41421C20.7893 6.78929 21 7.29799 21 7.82843V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19Z" stroke="currentColor" stroke-width="1.5" />
                            <path d="M8.6 9H15.4C15.7314 9 16 8.73137 16 8.4V3.6C16 3.26863 15.7314 3 15.4 3H8.6C8.26863 3 8 3.26863 8 3.6V8.4C8 8.73137 8.26863 9 8.6 9Z" stroke="currentColor" stroke-width="1.5" />
                            <path d="M6 13.6V21H18V13.6C18 13.2686 17.7314 13 17.4 13H6.6C6.26863 13 6 13.2686 6 13.6Z" stroke="currentColor" stroke-width="1.5" />
                        </svg>, this);
                case 'file-menu':
                    return render(
                        <svg width="24" height="24" class="w-12 h-5 stroke-2" stroke-width="1.5" viewBox="0 0 48 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2 11V4.6C2 4.26863 2.26863 4 2.6 4H8.77805C8.92127 4 9.05977 4.05124 9.16852 4.14445L12.3315 6.85555C12.4402 6.94876 12.5787 7 12.722 7H21.4C21.7314 7 22 7.26863 22 7.6V11M2 11V19.4C2 19.7314 2.26863 20 2.6 20H21.4C21.7314 20 22 19.7314 22 19.4V11M2 11H22" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <g transform="translate(24, 0)">
                                <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            </g>
                        </svg>, this);
                case 'settings-menu':
                    return render(
                        <svg width="24" height="24" class="w-5 h-5 stroke-2" stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M19.6224 10.3954L18.5247 7.7448L20 6L18 4L16.2647 5.48295L13.5578 4.36974L12.9353 2H10.981L10.3491 4.40113L7.70441 5.51596L6 4L4 6L5.45337 7.78885L4.3725 10.4463L2 11V13L4.40111 13.6555L5.51575 16.2997L4 18L6 20L7.79116 18.5403L10.397 19.6123L11 22H13L13.6045 19.6132L16.2551 18.5155C16.6969 18.8313 18 20 18 20L20 18L18.5159 16.2494L19.6139 13.598L21.9999 12.9772L22 11L19.6224 10.3954Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            {/* <g transform="translate(24, 0)">
                                <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            </g> */}
                        </svg>, this);
                case 'import':
                    return render(
                        <svg width="24" height="24" class="w-5 h-5 stroke-2" stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 13V19C4 20.1046 4.89543 21 6 21H18C19.1046 21 20 20.1046 20 19V13" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M12 3L12 15M12 15L8.5 11.5M12 15L15.5 11.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>, this);
                case 'control-point':
                    return render(
                        <svg width="24" height="24" class="w-icon h-icon stroke-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z" fill="currentColor" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M21 7.35304L21 16.647C21 16.8649 20.8819 17.0656 20.6914 17.1715L12.2914 21.8381C12.1102 21.9388 11.8898 21.9388 11.7086 21.8381L3.30861 17.1715C3.11814 17.0656 3 16.8649 3 16.647L2.99998 7.35304C2.99998 7.13514 3.11812 6.93437 3.3086 6.82855L11.7086 2.16188C11.8898 2.06121 12.1102 2.06121 12.2914 2.16188L20.6914 6.82855C20.8818 6.93437 21 7.13514 21 7.35304Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>, this);
                case 'edge':
                    return render(
                        <svg width="24" height="24" class="w-icon h-icon stroke-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 7.35304L21 16.647C21 16.8649 20.8819 17.0656 20.6914 17.1715L12.2914 21.8381C12.1102 21.9388 11.8898 21.9388 11.7086 21.8381L3.30861 17.1715C3.11814 17.0656 3 16.8649 3 16.647L2.99998 7.35304C2.99998 7.13514 3.11812 6.93437 3.3086 6.82855L11.7086 2.16188C11.8898 2.06121 12.1102 2.06121 12.2914 2.16188L20.6914 6.82855C20.8818 6.93437 21 7.13514 21 7.35304Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M12 21L12 12" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M12.5 11V21C12.5 21.2761 12.2761 21.5 12 21.5C11.7239 21.5 11.5 21.2761 11.5 21V11C11.5 10.7239 11.7239 10.5 12 10.5C12.2761 10.5 12.5 10.7239 12.5 11Z" fill="currentColor" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />

                        </svg>, this);
                case 'face':
                    return render(
                        <svg width="24" height="24" class="w-icon h-icon stroke-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 7.35304L21 16.647C21 16.8649 20.8819 17.0656 20.6914 17.1715L12.2914 21.8381C12.1102 21.9388 11.8898 21.9388 11.7086 21.8381L3.30861 17.1715C3.11814 17.0656 3 16.8649 3 16.647L2.99998 7.35304C2.99998 7.13514 3.11812 6.93437 3.3086 6.82855L11.7086 2.16188C11.8898 2.06121 12.1102 2.06121 12.2914 2.16188L20.6914 6.82855C20.8818 6.93437 21 7.13514 21 7.35304Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M3.52844 7.29357L11.7086 11.8381C11.8898 11.9388 12.1102 11.9388 12.2914 11.8381L20.5 7.27777" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M12 21L12 12" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M11.6914 11.8285L3.89139 7.49521C3.49147 7.27304 3 7.56222 3 8.01971V16.647C3 16.8649 3.11813 17.0656 3.30861 17.1715L11.1086 21.5048C11.5085 21.727 12 21.4378 12 20.9803V12.353C12 12.1351 11.8819 11.9344 11.6914 11.8285Z" fill="currentColor" stroke="currentColor" stroke-linejoin="round" />
                        </svg>, this);
                case 'solid':
                    return render(
                        <svg width="24" height="24" class="w-icon h-icon stroke-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2.6954 7.18536L11.6954 11.1854L12.3046 9.81464L3.3046 5.81464L2.6954 7.18536ZM12.75 21.5V10.5H11.25V21.5H12.75ZM12.3046 11.1854L21.3046 7.18536L20.6954 5.81464L11.6954 9.81464L12.3046 11.1854Z" fill="currentColor" />
                            <path d="M3 17.1101V6.88992C3 6.65281 3.13964 6.43794 3.35632 6.34164L11.7563 2.6083C11.9115 2.53935 12.0885 2.53935 12.2437 2.6083L20.6437 6.34164C20.8604 6.43794 21 6.65281 21 6.88992V17.1101C21 17.3472 20.8604 17.5621 20.6437 17.6584L12.2437 21.3917C12.0885 21.4606 11.9115 21.4606 11.7563 21.3917L3.35632 17.6584C3.13964 17.5621 3 17.3472 3 17.1101Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>, this);
                case 'orthographic-view':
                    return render(
                        <svg width="24" height="24" class="w-icon h-icon stroke-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 21V3H21V21H3Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M3 16.5H12H21" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M3 12H21" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M3 7.5H21" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M16.5 3V12V21" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M12 3V21" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M7.5 3V21" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>, this);
                case 'perspective-view':
                    return render(
                        <svg width="24" height="24" class="w-icon h-icon stroke-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 21L4.14286 3H19.8571L23 21H1Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M2 16.5H22" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M3 12H21" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M4 7.5H20" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M12 3V21" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M8 3.5L6.5 20.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M16 3.5L17.5 20.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>, this);
                case 'xray':
                    return render(
                        <svg width="24" height="24" class="w-icon h-icon stroke-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 7.35304L21 16.647C21 16.8649 20.8819 17.0656 20.6914 17.1715L12.2914 21.8381C12.1102 21.9388 11.8898 21.9388 11.7086 21.8381L3.30861 17.1715C3.11814 17.0656 3 16.8649 3 16.647L2.99998 7.35304C2.99998 7.13514 3.11812 6.93437 3.3086 6.82855L11.7086 2.16188C11.8898 2.06121 12.1102 2.06121 12.2914 2.16188L20.6914 6.82855C20.8818 6.93437 21 7.13514 21 7.35304Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M20.5 16.7222L12.2914 12.1619C12.1102 12.0612 11.8898 12.0612 11.7086 12.1619L3.5 16.7222" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M3.52844 7.29357L11.7086 11.8381C11.8898 11.9388 12.1102 11.9388 12.2914 11.8381L20.5 7.27777" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M12 21L12 3" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>, this);
                case 'render-mode':
                    return render(
                        <svg width="24" height="24" class="w-icon h-icon stroke-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M17.1973 9C17.0976 8.82774 16.9896 8.66089 16.8739 8.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M17.811 13.5C17.2683 15.6084 15.6084 17.2683 13.5 17.811" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />                        </svg>, this);
                case 'overlays':
                    return render(
                        <svg width="24" height="24" class="w-icon h-icon stroke-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 19.4516L12 12.8428M12 12.8428L12 2.99999M12 12.8428L3 19.4516" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M20.4375 16.7097L21 19.4516L18.1875 20" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M9.75 5.19354L12 2.99999L14.25 5.19354" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M5.8125 20L3 19.4516L3.5625 16.7097" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>, this);
                case 'line':
                    return render(
                        <svg width="24" height="24" class="w-icon h-icon stroke-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 20L21 4" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>, this);
                case 'curve':
                    return render(
                        <svg width="24" height="24" class="w-icon h-icon stroke-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 20C11 20 13 4 21 4" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>, this);
                case 'pipe':
                case 'center-circle':
                    return render(
                        <svg width="24" height="24" class="w-icon h-icon stroke-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z" fill="currentColor" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M15 15L15.0111 15.01" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M17 17L17.0111 17.01" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>, this);
                case 'two-point-circle':
                    return render(
                        <svg width="24" height="24" class="w-icon h-icon stroke-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M5 6C5.55228 6 6 5.55228 6 5C6 4.44772 5.55228 4 5 4C4.44772 4 4 4.44772 4 5C4 5.55228 4.44772 6 5 6Z" fill="currentColor" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M19 20C19.5523 20 20 19.5523 20 19C20 18.4477 19.5523 18 19 18C18.4477 18 18 18.4477 18 19C18 19.5523 18.4477 20 19 20Z" fill="currentColor" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M15 15L15.0111 15.01" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M13 13L13.0111 13.01" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M11 11L11.0111 11.01" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M9.00001 9L9.01112 9.01" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M7.00001 7L7.01112 7.01" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M17 17L17.0111 17.01" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>, this);
                case 'three-point-circle':
                    return render(
                        <svg width="24" height="24" class="w-icon h-icon stroke-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M5 6C5.55228 6 6 5.55228 6 5C6 4.44772 5.55228 4 5 4C4.44772 4 4 4.44772 4 5C4 5.55228 4.44772 6 5 6Z" fill="currentColor" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M5 20C5.55228 20 6 19.5523 6 19C6 18.4477 5.55228 18 5 18C4.44772 18 4 18.4477 4 19C4 19.5523 4.44772 20 5 20Z" fill="currentColor" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M19 20C19.5523 20 20 19.5523 20 19C20 18.4477 19.5523 18 19 18C18.4477 18 18 18.4477 18 19C18 19.5523 18.4477 20 19 20Z" fill="currentColor" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M5.00001 15L5.01112 15.01" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M5.00001 12L5.01112 12.01" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M5.00001 9L5.01112 9.01" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M15 19.01L15.01 18.9989" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M12 19.01L12.01 18.9989" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M9 19.01L9.01 18.9989" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>, this);
                case 'center-point-arc':
                    return render(
                        <svg width="24" height="24" class="w-icon h-icon stroke-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 19C19 10.6 13.4 5 5 5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>, this);
                case 'three-point-arc':
                    return render(
                        <svg width="24" height="24" class="w-icon h-icon stroke-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 19C12 14.8 9.2 12 5 12" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M19 19C19 10.6 13.4 5 5 5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M5 19.01L5.01 18.9989" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>, this);
                case 'center-ellipse':
                    return render(
                        <svg width="24" height="24" class="w-icon h-icon stroke-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 22C16.4183 22 20 18.4183 20 14C20 9.58172 16.4183 2 12 2C7.58172 2 4 9.58172 4 14C4 18.4183 7.58172 22 12 22Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>, this);
                case 'three-point-ellipse':
                    return render(
                        <svg width="24" height="24" class="w-icon h-icon stroke-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 22C16.4183 22 20 18.4183 20 14C20 9.58172 16.4183 2 12 2C7.58172 2 4 9.58172 4 14C4 18.4183 7.58172 22 12 22Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>, this);
                case 'corner-rectangle':
                    return render(
                        <svg width="24" height="24" class="w-icon h-icon stroke-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4.9984 2H2V4.9984H4.9984V2Z" stroke="currentColor" stroke-width="1.4992" stroke-miterlimit="1.5" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M4.9978 3.50098H18.998" stroke="currentColor" stroke-width="1.50335" stroke-miterlimit="1.5" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M3.49878 4.99805V19" stroke="currentColor" stroke-width="1.35589" stroke-miterlimit="1.5" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M20.4968 4.99951V19.0015" stroke="currentColor" stroke-width="1.35589" stroke-miterlimit="1.5" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M4.9978 20.501H18.998" stroke="currentColor" stroke-width="1.50335" stroke-miterlimit="1.5" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M21.9964 19.002H18.998V22.0004H21.9964V19.002Z" stroke="currentColor" stroke-width="1.4992" stroke-miterlimit="1.5" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>, this);
                case 'center-rectangle':
                    return render(
                        <svg width="24" height="24" class="w-icon h-icon stroke-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17 20C17 21.1046 17.8954 22 19 22C20.1046 22 21 21.1046 21 20C21 18.8954 20.1046 18 19 18C17.8954 18 17 18.8954 17 20ZM17 20H15" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M7 4C7 5.10457 6.10457 6 5 6C3.89543 6 3 5.10457 3 4C3 2.89543 3.89543 2 5 2C6.10457 2 7 2.89543 7 4ZM7 4L9 4" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M14 4L12 4" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M12 20H10" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M3 20C11 20 13 4 21 4" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>, this);
                case 'three-point-rectangle':
                    return render(
                        <svg width="24" height="24" class="w-icon h-icon stroke-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4.9984 2H2V4.9984H4.9984V2Z" stroke="currentColor" stroke-width="1.4992" stroke-miterlimit="1.5" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M21.9964 2.00195H18.998V5.00035H21.9964V2.00195Z" stroke="currentColor" stroke-width="1.4992" stroke-miterlimit="1.5" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M21.9964 19.002H18.998V22.0004H21.9964V19.002Z" stroke="currentColor" stroke-width="1.4992" stroke-miterlimit="1.5" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>, this);
                case 'polygon':
                    return render(
                        <svg width="24" height="24" class="w-icon h-icon stroke-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11.7 1.1732C11.8856 1.06603 12.1144 1.06603 12.3 1.17321L21.2263 6.3268C21.4119 6.43397 21.5263 6.63205 21.5263 6.84641V17.1536C21.5263 17.3679 21.4119 17.566 21.2263 17.6732L12.3 22.8268C12.1144 22.934 11.8856 22.934 11.7 22.8268L2.77372 17.6732C2.58808 17.566 2.47372 17.3679 2.47372 17.1536V6.84641C2.47372 6.63205 2.58808 6.43397 2.77372 6.32679L11.7 1.1732Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>, this);
                case 'spiral':
                    return render(
                        <svg width="24" height="24" class="w-icon h-icon stroke-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21.4383 11.6622L12.2483 20.8522C11.1225 21.9781 9.59552 22.6106 8.00334 22.6106C6.41115 22.6106 4.88418 21.9781 3.75834 20.8522C2.63249 19.7264 2 18.1994 2 16.6072C2 15.015 2.63249 13.4881 3.75834 12.3622L12.9483 3.17222C13.6989 2.42166 14.7169 2 15.7783 2C16.8398 2 17.8578 2.42166 18.6083 3.17222C19.3589 3.92279 19.7806 4.94077 19.7806 6.00222C19.7806 7.06368 19.3589 8.08166 18.6083 8.83222L9.40834 18.0222C9.03306 18.3975 8.52406 18.6083 7.99334 18.6083C7.46261 18.6083 6.95362 18.3975 6.57834 18.0222C6.20306 17.6469 5.99222 17.138 5.99222 16.6072C5.99222 16.0765 6.20306 15.5675 6.57834 15.1922L15.0683 6.71222" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>, this);
                case 'character-curve':
                    return render(
                        <svg width="24" height="24" class="w-icon h-icon stroke-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 12H6L9 3L15 21L18 12H21" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>, this);
                case 'trim':
                    return render(
                        <svg width="24" height="24" class="w-icon h-icon stroke-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M7.23611 7C7.71115 6.46924 8 5.76835 8 5C8 3.34315 6.65685 2 5 2C3.34315 2 2 3.34315 2 5C2 6.65685 3.34315 8 5 8C5.8885 8 6.68679 7.61375 7.23611 7ZM7.23611 7L20 18" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M7.23611 17C7.71115 17.5308 8 18.2316 8 19C8 20.6569 6.65685 22 5 22C3.34315 22 2 20.6569 2 19C2 17.3431 3.34315 16 5 16C5.8885 16 6.68679 16.3863 7.23611 17ZM7.23611 17L20 6" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>, this);
                case 'bridge-curves':
                    return render(
                        <svg width="24" height="24" class="w-icon h-icon stroke-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="3" y="2" width="7" height="5" rx="0.6" stroke="currentColor" stroke-width="1.5" />
                            <rect x="8.5" y="17" width="7" height="5" rx="0.6" stroke="currentColor" stroke-width="1.5" />
                            <rect x="14" y="2" width="7" height="5" rx="0.6" stroke="currentColor" stroke-width="1.5" />
                            <path d="M6.5 7V10.5C6.5 11.6046 7.39543 12.5 8.5 12.5H15.5C16.6046 12.5 17.5 11.6046 17.5 10.5V7" stroke="currentColor" stroke-width="1.5" />
                            <path d="M12 12.5V17" stroke="currentColor" stroke-width="1.5" />
                        </svg>, this);
                case 'sphere':
                    return render(
                        <svg width="24" height="24" class="w-icon h-icon stroke-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M13 2.04932C13 2.04932 16 5.99994 16 11.9999" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M11 21.9506C11 21.9506 8 17.9999 8 11.9999C8 5.99994 11 2.04932 11 2.04932" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M2.62964 15.5H12" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M2.62964 8.5H21.3704" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M21.8789 17.9174C22.3727 18.2211 22.3423 18.9604 21.8337 19.0181L19.2671 19.309L18.1159 21.6213C17.8878 22.0795 17.1827 21.8552 17.0661 21.2873L15.8108 15.1713C15.7123 14.6913 16.1437 14.3892 16.561 14.646L21.8789 17.9174Z" stroke="currentColor" />
                        </svg>, this);
                case 'cylinder':
                    return render(
                        <svg width="24" height="24" class="w-icon h-icon stroke-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 6V12C4 12 4 15 11 15C18 15 18 12 18 12V6" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M11 3C18 3 18 6 18 6C18 6 18 9 11 9C4 9 4 6 4 6C4 6 4 3 11 3Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M19 22V16M19 16L22 19M19 16L16 19" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>, this);
                case 'elementary-solid':
                case 'corner-box':
                    return render(
                        <svg width="24" height="24" class="w-icon h-icon stroke-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2.6954 7.18536L11.6954 11.1854L12.3046 9.81464L3.3046 5.81464L2.6954 7.18536ZM12.75 21.5V10.5H11.25V21.5H12.75ZM12.3046 11.1854L21.3046 7.18536L20.6954 5.81464L11.6954 9.81464L12.3046 11.1854Z" fill="currentColor" />
                            <path d="M3 17.1101V6.88992C3 6.65281 3.13964 6.43794 3.35632 6.34164L11.7563 2.6083C11.9115 2.53935 12.0885 2.53935 12.2437 2.6083L20.6437 6.34164C20.8604 6.43794 21 6.65281 21 6.88992V17.1101C21 17.3472 20.8604 17.5621 20.6437 17.6584L12.2437 21.3917C12.0885 21.4606 11.9115 21.4606 11.7563 21.3917L3.35632 17.6584C3.13964 17.5621 3 17.3472 3 17.1101Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>, this);
                case 'center-box':
                    return render(
                        <svg width="24" height="24" class="w-icon h-icon stroke-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2.6954 7.18536L11.6954 11.1854L12.3046 9.81464L3.3046 5.81464L2.6954 7.18536ZM12.75 21.5V10.5H11.25V21.5H12.75ZM12.3046 11.1854L21.3046 7.18536L20.6954 5.81464L11.6954 9.81464L12.3046 11.1854Z" fill="currentColor" />
                            <path d="M3 17.1101V6.88992C3 6.65281 3.13964 6.43794 3.35632 6.34164L11.7563 2.6083C11.9115 2.53935 12.0885 2.53935 12.2437 2.6083L20.6437 6.34164C20.8604 6.43794 21 6.65281 21 6.88992V17.1101C21 17.3472 20.8604 17.5621 20.6437 17.6584L12.2437 21.3917C12.0885 21.4606 11.9115 21.4606 11.7563 21.3917L3.35632 17.6584C3.13964 17.5621 3 17.3472 3 17.1101Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>, this);
                case 'three-point-box':
                    return render(
                        <svg width="24" height="24" class="w-icon h-icon stroke-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2.6954 7.18536L11.6954 11.1854L12.3046 9.81464L3.3046 5.81464L2.6954 7.18536ZM12.75 21.5V10.5H11.25V21.5H12.75ZM12.3046 11.1854L21.3046 7.18536L20.6954 5.81464L11.6954 9.81464L12.3046 11.1854Z" fill="currentColor" />
                            <path d="M3 17.1101V6.88992C3 6.65281 3.13964 6.43794 3.35632 6.34164L11.7563 2.6083C11.9115 2.53935 12.0885 2.53935 12.2437 2.6083L20.6437 6.34164C20.8604 6.43794 21 6.65281 21 6.88992V17.1101C21 17.3472 20.8604 17.5621 20.6437 17.6584L12.2437 21.3917C12.0885 21.4606 11.9115 21.4606 11.7563 21.3917L3.35632 17.6584C3.13964 17.5621 3 17.3472 3 17.1101Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M7.5 4.5L16.1437 8.34164C16.3604 8.43794 16.5 8.65281 16.5 8.88992V12.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>, this);
                case 'delete':
                    return render(
                        <svg width="24" height="24" class="w-icon h-icon stroke-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 11V20.4C19 20.7314 18.7314 21 18.4 21H5.6C5.26863 21 5 20.7314 5 20.4V11" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M10 17V11" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M14 17V11" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M21 7L16 7M3 7L8 7M8 7V3.6C8 3.26863 8.26863 3 8.6 3L15.4 3C15.7314 3 16 3.26863 16 3.6V7M8 7L16 7" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>, this);
                case 'transformed-solid':
                case 'move':
                    return render(
                        <svg width="24" height="24" class="w-icon h-icon stroke-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 9L12 22M12 22L15 19M12 22L9 19" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M12 15L12 2M12 2L15 5M12 2L9 5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M15 12H2M2 12L5 9M2 12L5 15" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M9 12H22M22 12L19 9M22 12L19 15" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>, this);
                case 'draft-solid':
                case 'rotate':
                    return render(
                        <svg width="24" height="24" class="w-icon h-icon stroke-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5.5 12V16C5.5 18.2091 7.29086 20 9.5 20H10.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M3 14.5L5.5 12L8 14.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M18 12V8C18 5.79086 16.2091 4 14 4H13" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M20.5 9.5L18 12L15.5 9.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>, this);
                case 'place':
                case 'scale':
                    return render(
                        <svg width="24" height="24" class="w-icon h-icon stroke-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11 13.6V21H3.6C3.26863 21 3 20.7314 3 20.4V13H10.4C10.7314 13 11 13.2686 11 13.6Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M11 21H14" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M3 13V10" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M6 3H3.6C3.26863 3 3 3.26863 3 3.6V6" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M14 3H10" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M21 10V14" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M18 3H20.4C20.7314 3 21 3.26863 21 3.6V6" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M18 21H20.4C20.7314 21 21 20.7314 21 20.4V18" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M11 10H14V13" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />                        </svg>, this);
                case 'shell':
                    return render(
                        <svg width="24" height="24" class="w-icon h-icon stroke-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12.0098 16L11.9998 16.0111" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M12.0098 12L11.9998 12.0111" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M12.0098 8.00001L11.9998 8.01112" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M8.00977 12L7.99977 12.0111" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M16.0098 12L15.9998 12.0111" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M21 3.6V20.4C21 20.7314 20.7314 21 20.4 21H3.6C3.26863 21 3 20.7314 3 20.4V3.6C3 3.26863 3.26863 3 3.6 3H20.4C20.7314 3 21 3.26863 21 3.6Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>, this);
                case 'symmetry-solid':
                case 'mirror':
                    return render(
                        <svg width="24" height="24" class="w-icon h-icon stroke-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9.5 20H2L9.5 4V20Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M20.125 20H22L21.0625 18" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M16.375 20H14.5V18" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M14.5 12V14" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M18.25 12L19.1875 14" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M16.375 8L14.5 4V8" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>, this);
                case 'radial-array':
                    return render(
                        <svg width="24" height="24" class="w-icon h-icon stroke-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 11.5C14.2091 11.5 16 9.70914 16 7.5C16 5.29086 14.2091 3.5 12 3.5C9.79086 3.5 8 5.29086 8 7.5C8 9.70914 9.79086 11.5 12 11.5Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M7 20.5C9.20914 20.5 11 18.7091 11 16.5C11 14.2909 9.20914 12.5 7 12.5C4.79086 12.5 3 14.2909 3 16.5C3 18.7091 4.79086 20.5 7 20.5Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M17 20.5C19.2091 20.5 21 18.7091 21 16.5C21 14.2909 19.2091 12.5 17 12.5C14.7909 12.5 13 14.2909 13 16.5C13 18.7091 14.7909 20.5 17 20.5Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>, this);
                case 'rectangular-array':
                    return render(
                        <svg width="24" height="24" class="w-icon h-icon stroke-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M14 20.4V14.6C14 14.2686 14.2686 14 14.6 14H20.4C20.7314 14 21 14.2686 21 14.6V20.4C21 20.7314 20.7314 21 20.4 21H14.6C14.2686 21 14 20.7314 14 20.4Z" stroke="currentColor" stroke-width="1.5" />
                            <path d="M3 20.4V14.6C3 14.2686 3.26863 14 3.6 14H9.4C9.73137 14 10 14.2686 10 14.6V20.4C10 20.7314 9.73137 21 9.4 21H3.6C3.26863 21 3 20.7314 3 20.4Z" stroke="currentColor" stroke-width="1.5" />
                            <path d="M14 9.4V3.6C14 3.26863 14.2686 3 14.6 3H20.4C20.7314 3 21 3.26863 21 3.6V9.4C21 9.73137 20.7314 10 20.4 10H14.6C14.2686 10 14 9.73137 14 9.4Z" stroke="currentColor" stroke-width="1.5" />
                            <path d="M3 9.4V3.6C3 3.26863 3.26863 3 3.6 3H9.4C9.73137 3 10 3.26863 10 3.6V9.4C10 9.73137 9.73137 10 9.4 10H3.6C3.26863 10 3 9.73137 3 9.4Z" stroke="currentColor" stroke-width="1.5" />
                        </svg>, this);
                case 'curve-extrusion-solid':
                case 'extrude':
                    return render(
                        <svg width="24" height="24" class="w-icon h-icon stroke-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 2L6 2" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M18 22L6 22" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M12 14V19M12 19L15 16M12 19L9 16" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M12 10V5M12 5L15 8M12 5L9 8" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>, this);
                case 'boolean-solid':
                case 'union-solid':
                case 'boolean':
                    return render(
                        <svg width="24" height="24" class="w-icon h-icon stroke-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15 9H20.4C20.7314 9 21 9.26863 21 9.6V20.4C21 20.7314 20.7314 21 20.4 21H9.6C9.26863 21 9 20.7314 9 20.4V15" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M15 9V3.6C15 3.26863 14.7314 3 14.4 3H3.6C3.26863 3 3 3.26863 3 3.6V14.4C3 14.7314 3.26863 15 3.6 15H9" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>, this);
                case 'intersection':
                    return render(
                        <svg width="24" height="24" class="w-icon h-icon stroke-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 13.5V16.5M13.5 21H16.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M16.5 9H9.6C9.26863 9 9 9.26863 9 9.6V16.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M10.5 21H9.6C9.26863 21 9 20.7314 9 20.4V19.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M21 19.5V20.4C21 20.7314 20.7314 21 20.4 21H19.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M19.5 9H20.4C20.7314 9 21 9.26863 21 9.6V10.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M3 10.5V7.5M7.5 3H10.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M7.5 15H14.4C14.7314 15 15 14.7314 15 14.4V7.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M4.5 15H3.6C3.26863 15 3 14.7314 3 14.4V13.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M3 4.5V3.6C3 3.26863 3.26863 3 3.6 3H4.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M13.5 3H14.4C14.7314 3 15 3.26863 15 3.6V4.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>, this);
                case 'difference':
                    return render(
                        <svg width="24" height="24" class="w-icon h-icon stroke-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15 3.6V14.4C15 14.7314 14.7314 15 14.4 15H3.6C3.26863 15 3 14.7314 3 14.4V3.6C3 3.26863 3.26863 3 3.6 3H14.4C14.7314 3 15 3.26863 15 3.6Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M13.5 21H16.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M21 13.5V16.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M21 19.5V20.4C21 20.7314 20.7314 21 20.4 21H19.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M10.5 21H9.6C9.26863 21 9 20.7314 9 20.4V19.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M19.5 9H20.4C20.7314 9 21 9.26863 21 9.6V10.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M16.5 9H9.6C9.26863 9 9 9.26863 9 9.6V16.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>, this);
                case 'offset-curve':
                    return render(
                        <svg width="24" height="24" class="w-icon h-icon stroke-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M13.8476 13.317L9.50515 18.2798C8.70833 19.1905 7.29167 19.1905 6.49485 18.2798L2.15238 13.317C1.49259 12.563 1.49259 11.437 2.15238 10.683L6.49485 5.72018C7.29167 4.80952 8.70833 4.80952 9.50515 5.72017L13.8476 10.683C14.5074 11.437 14.5074 12.563 13.8476 13.317Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M13 19L17.8844 13.3016C18.5263 12.5526 18.5263 11.4474 17.8844 10.6984L13 5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M17 19L21.8844 13.3016C22.5263 12.5526 22.5263 11.4474 21.8844 10.6984L17 5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>, this);
                case 'extension-shell':
                    return render(
                        <svg width="24" height="24" class="w-icon h-icon stroke-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15.7001 12.3748L12.4685 16.4143C12.2283 16.7146 11.7717 16.7146 11.5315 16.4143L8.29985 12.3748C8.12455 12.1557 8.12455 11.8443 8.29985 11.6252L11.5315 7.58565C11.7717 7.28541 12.2283 7.28541 12.4685 7.58565L15.7001 11.6252C15.8755 11.8443 15.8755 12.1557 15.7001 12.3748Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M12 22V20" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M12 4V2" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M4 12H2" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M22 12H20" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>, this);
                case 'cutting-solid':
                case 'cut':
                    return render(
                        <svg width="24" height="24" class="w-icon h-icon stroke-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 20.01L4.01 19.9989" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M4 16.01L4.01 15.9989" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M4 8.01L4.01 7.99889" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M4 4.01L4.01 3.99889" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M8 4.01L8.01 3.99889" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M16 4.01L16.01 3.99889" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M20 4.01L20.01 3.99889" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M20 8.01L20.01 7.99889" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M8 20.01L8.01 19.9989" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M16 20.01L16.01 19.9989" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M20 20.01L20.01 19.9989" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M20 16.01L20.01 15.9989" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M4 12H12M20 12H12M12 12V4M12 12V20" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>, this);
                case 'revolution':
                    return render(
                        <svg width="24" height="24" class="w-icon h-icon stroke-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 6L12 8" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M12 16L12 18" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M8 12H6" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M18 12H16" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>, this);
                case 'evolution':
                case 'loft':
                    return render(
                        <svg width="24" height="24" class="w-icon h-icon stroke-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15 3.6V14.4C15 14.7314 14.7314 15 14.4 15H3.6C3.26863 15 3 14.7314 3 14.4V3.6C3 3.26863 3.26863 3 3.6 3H14.4C14.7314 3 15 3.26863 15 3.6Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M13.5 21H16.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M21 13.5V16.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M21 19.5V20.4C21 20.7314 20.7314 21 20.4 21H19.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M10.5 21H9.6C9.26863 21 9 20.7314 9 20.4V19.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M19.5 9H20.4C20.7314 9 21 9.26863 21 9.6V10.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M16.5 9H9.6C9.26863 9 9 9.26863 9 9.6V16.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>, this);
                case 'join-curves':
                    return render(
                        <svg width="24" height="24" class="w-icon h-icon stroke-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 12H12M16 12H12M12 12V8M12 12V16" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>, this);
                case 'chamfer-solid':
                case 'fillet-solid':
                    return render(
                        <svg width="24" height="24" class="w-icon h-icon stroke-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15 3.6V14.4C15 14.7314 14.7314 15 14.4 15H3.6C3.26863 15 3 14.7314 3 14.4V3.6C3 3.26863 3.26863 3 3.6 3H14.4C14.7314 3 15 3.26863 15 3.6Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M13.5 21H16.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M21 13.5V16.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M21 19.5V20.4C21 20.7314 20.7314 21 20.4 21H19.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M10.5 21H9.6C9.26863 21 9 20.7314 9 20.4V19.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M19.5 9H20.4C20.7314 9 21 9.26863 21 9.6V10.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M16.5 9H9.6C9.26863 9 9 9.26863 9 9.6V16.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>, this);
                case 'face-modified-solid':
                case 'offset-face':
                    return render(
                        <svg width="24" height="24" class="w-icon h-icon stroke-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15 3.6V14.4C15 14.7314 14.7314 15 14.4 15H3.6C3.26863 15 3 14.7314 3 14.4V3.6C3 3.26863 3.26863 3 3.6 3H14.4C14.7314 3 15 3.26863 15 3.6Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M13.5 21H16.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M21 13.5V16.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M21 19.5V20.4C21 20.7314 20.7314 21 20.4 21H19.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M10.5 21H9.6C9.26863 21 9 20.7314 9 20.4V19.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M19.5 9H20.4C20.7314 9 21 9.26863 21 9.6V10.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M16.5 9H9.6C9.26863 9 9 9.26863 9 9.6V16.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>, this);
                case 'duplicate':
                    return render(
                        <svg width="24" height="24" class="w-icon h-icon stroke-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19.4 20H9.6C9.26863 20 9 19.7314 9 19.4V9.6C9 9.26863 9.26863 9 9.6 9H19.4C19.7314 9 20 9.26863 20 9.6V19.4C20 19.7314 19.7314 20 19.4 20Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M15 9V4.6C15 4.26863 14.7314 4 14.4 4H4.6C4.26863 4 4 4.26863 4 4.6V14.4C4 14.7314 4.26863 15 4.6 15H9" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>, this);
                case 'slot':
                    return render(
                        <svg width="24" height="24" class="w-icon h-icon stroke-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M7 19.4V4.6C7 4.26863 7.26863 4 7.6 4H16.4C16.7314 4 17 4.26863 17 4.6V19.4C17 19.7314 16.7314 20 16.4 20H7.6C7.26863 20 7 19.7314 7 19.4Z" stroke="currentColor" stroke-width="1.5" />
                        </svg>, this);
                case 'eye':
                    return render(
                        <svg width="24" height="24" class="w-icon h-icon stroke-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M21 12C19.1114 14.991 15.7183 18 12 18C8.2817 18 4.88856 14.991 3 12C5.29855 9.15825 7.99163 6 12 6C16.0084 6 18.7015 9.1582 21 12Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>, this);
                case 'eye-off':
                    return render(
                        <svg width="24" height="24" class="w-icon h-icon stroke-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4.5 8C7.5 14.5 16.5 14.5 19.5 8" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M16.8162 11.3175L19.5 15" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M12 12.875V16.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M7.18383 11.3175L4.5 15" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>, this);
                case 'light-bulb-on':
                    return render(
                        <svg width="24" height="24" class="w-icon h-icon stroke-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 2L20 3" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M3 2L4 3" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M21 16L20 15" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M3 16L4 15" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M9 18H15" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M10 21H14" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M11.9998 3C7.9997 3 5.95186 4.95029 5.99985 8C6.02324 9.48689 6.4997 10.5 7.49985 11.5C8.5 12.5 9 13 8.99985 15H14.9998C15 13.0001 15.5 12.5 16.4997 11.5001L16.4998 11.5C17.4997 10.5 17.9765 9.48689 17.9998 8C18.0478 4.95029 16 3 11.9998 3Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>, this);
                case 'light-bulb-off':
                    return render(
                        <svg width="24" height="24" class="w-icon h-icon stroke-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 18H15" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M10 21H14" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M16.4999 11.5C17.4997 10.5 17.9765 9.48689 17.9999 8C18.0479 4.95029 16 3 11.9999 3C10.8324 3 9.83119 3.16613 8.99988 3.47724" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M8.99985 15C9 13 8.5 12.5 7.49985 11.5C6.4997 10.5 6.02324 9.48689 5.99985 8C5.99142 7.46458 6.0476 6.96304 6.1676 6.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M3 3L21 21" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>, this);
                case 'lock':
                    return render(
                        <svg width="24" height="24" class="w-icon h-icon stroke-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M16 12H17.4C17.7314 12 18 12.2686 18 12.6V19.4C18 19.7314 17.7314 20 17.4 20H6.6C6.26863 20 6 19.7314 6 19.4V12.6C6 12.2686 6.26863 12 6.6 12H8M16 12V8C16 6.66667 15.2 4 12 4C8.8 4 8 6.66667 8 8V12M16 12H8" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>, this);
                case 'no-lock':
                    return render(
                        <svg width="24" height="24" class="w-icon h-icon stroke-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11.5 12H6.6C6.26863 12 6 12.2686 6 12.6V19.4C6 19.7314 6.26863 20 6.6 20H17.4C17.7314 20 18 19.7314 18 19.4V18.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M16 12V8C16 6.66667 15.2 4 12 4C11.2532 4 10.6371 4.14525 10.1313 4.38491" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M16 12H17.4C17.7314 12 18 12.2686 18 12.6V13" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M8 8V8.5V12" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M3 3L21 21" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>, this);
                case 'blank':
                    return render(
                        <svg width="24" height="24" class="w-icon h-icon stroke-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        </svg>, this);
                case 'alert':
                    return render(
                        <svg width="24" height="24" class="w-icon h-icon stroke-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 7V9" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M12 13.01L12.01 12.9989" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M3 20.2895V5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V15C21 16.1046 20.1046 17 19 17H7.96125C7.35368 17 6.77906 17.2762 6.39951 17.7506L4.06852 20.6643C3.71421 21.1072 3 20.8567 3 20.2895Z" stroke="currentColor" stroke-width="1.5" />
                        </svg>, this);
                case 'check':
                    return render(
                        <svg width="24" height="24" class="w-icon h-icon stroke-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 13L9 17L19 7" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>, this);
                case 'cancel':
                    return render(
                        <svg width="24" height="24" class="w-icon h-icon stroke-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6.75827 17.2426L12.0009 12M17.2435 6.75736L12.0009 12M12.0009 12L6.75827 6.75736M12.0009 12L17.2435 17.2426" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>, this);
                case 'nav-arrow-down':
                    return render(
                        <svg width="24" height="24" class="w-icon h-icon stroke-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>, this);
                case 'nav-arrow-right':
                    return render(
                        <svg width="24" height="24" class="w-icon h-icon stroke-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 6L15 12L9 18" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>, this);
                case 'group':
                    return render(
                        <svg width="24" height="24" class="w-icon h-icon stroke-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2 11V4.6C2 4.26863 2.26863 4 2.6 4H8.77805C8.92127 4 9.05977 4.05124 9.16852 4.14445L12.3315 6.85555C12.4402 6.94876 12.5787 7 12.722 7H21.4C21.7314 7 22 7.26863 22 7.6V11M2 11V19.4C2 19.7314 2.26863 20 2.6 20H21.4C21.7314 20 22 19.7314 22 19.4V11M2 11H22" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>, this);
                case 'folder-solids':
                    return render(
                        <svg width="24" height="24" class="w-icon h-icon stroke-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22 12.6V20.4C22 20.7314 21.7314 21 21.4 21H13.6C13.2686 21 13 20.7314 13 20.4V12.6C13 12.2686 13.2686 12 13.6 12H21.4C21.7314 12 22 12.2686 22 12.6Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M19.5 14.51L19.51 14.4989" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M13 18.2L16.5 17L22 19" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M2 10V3.6C2 3.26863 2.26863 3 2.6 3H8.77805C8.92127 3 9.05977 3.05124 9.16852 3.14445L12.3315 5.85555C12.4402 5.94876 12.5787 6 12.722 6H21.4C21.7314 6 22 6.26863 22 6.6V9M2 10V18.4C2 18.7314 2.26863 19 2.6 19H10M2 10H10" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>, this);
                case 'folder-curves':
                    return render(
                        <svg width="24" height="24" class="w-icon h-icon stroke-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22 12.6V20.4C22 20.7314 21.7314 21 21.4 21H13.6C13.2686 21 13 20.7314 13 20.4V12.6C13 12.2686 13.2686 12 13.6 12H21.4C21.7314 12 22 12.2686 22 12.6Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M16.918 14.5737C16.5184 14.324 16 14.6113 16 15.0825V17.9175C16 18.3887 16.5184 18.676 16.918 18.4263L19.1859 17.0088C19.5619 16.7738 19.5619 16.2262 19.1859 15.9912L16.918 14.5737Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M2 10V3.6C2 3.26863 2.26863 3 2.6 3H8.77805C8.92127 3 9.05977 3.05124 9.16852 3.14445L12.3315 5.85555C12.4402 5.94876 12.5787 6 12.722 6H21.4C21.7314 6 22 6.26863 22 6.6V9M2 10V18.4C2 18.7314 2.26863 19 2.6 19H10M2 10H10" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>, this);
                case 'add-circled-outline':
                    return render(
                        <svg width="24" height="24" class="w-icon h-icon stroke-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 12H12M16 12H12M12 12V8M12 12V16" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>, this);
                default:
                    console.warn(`${this.name} is missing icon`);
            }
        }
    }
    customElements.define('plasticity-icon', Icon);
}