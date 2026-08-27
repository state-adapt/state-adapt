# Upgrade Guide

This guide covers breaking changes across all StateAdapt libraries.

## 4.0

### Angular store activation

Stores created in local Angular injection contexts now activate immediately and stay active until the context is destroyed, even when none of their signals or observables are consumed. This can cause store sources to subscribe earlier than they did in 3.x. Stores in shared root services remain usage-based.

See the Angular [`adapt` API documentation](/api/angular/index/adapt.html) for more about store activation and cleanup.
