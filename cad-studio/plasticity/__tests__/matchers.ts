import * as THREE from "three";

declare global {
    namespace jest {
        interface Matchers<R> {
            toHaveQuaternion(quat: THREE.Quaternion): R;
            toApproximatelyEqual(vec: THREE.Vector3): R;
            toHaveCentroidNear(vec: THREE.Vector3): R;
        }
    }
}

expect.extend({
    toHaveQuaternion(received: { quaternion: THREE.Quaternion } | { orientation: THREE.Quaternion } | THREE.Quaternion, other: THREE.Quaternion) {
        // @ts-ignore
        const quat = received.quaternion ?? received.orientation ?? received;
        const pass = Math.abs(quat.dot(other)) > 1 - 10e-6;
        if (pass) {
            return {
                message: () => `expected quaternion ${quat.toArray()} not to equal ${other.toArray()}`,
                pass: pass && !this.isNot,
            }
        } else {
            return {
                message: () => `expected quaternion ${quat.toArray()} to equal ${other.toArray()}`,
                pass: pass && !this.isNot,
            }
        }
    }
});
expect.extend({
    toApproximatelyEqual(received: THREE.Vector3, other: THREE.Vector3) {
        const pass = received.distanceTo(other) < 0.01;
        if (pass) {
            return {
                message: () => `expected vec3 ${received.toArray()} not to equal ${other.toArray()}`,
                pass: pass && !this.isNot,
            }
        } else {
            return {
                message: () => `expected vec3 ${received.toArray()} to equal ${other.toArray()}`,
                pass: pass && !this.isNot,
            }
        }
    }
});
expect.extend({
    toHaveCentroidNear(received: THREE.Object3D, other: THREE.Vector3) {
        const bbox = new THREE.Box3().setFromObject(received);
        const center = new THREE.Vector3();
        bbox.getCenter(center);
        const pass = center.distanceTo(other) < 0.005;
        if (pass) {
            return {
                message: () => `expected vec3 ${center.toArray()} not to equal ${other.toArray()}`,
                pass: pass && !this.isNot,
            }
        } else {
            return {
                message: () => `expected vec3 ${center.toArray()} to equal ${other.toArray()}`,
                pass: pass && !this.isNot,
            }
        }
    }
});


export default {}

performance.mark = jest.fn();
performance.measure = jest.fn();
