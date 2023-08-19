
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    let render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = /* @__PURE__ */ Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    /**
     * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
     */
    function flush_render_callbacks(fns) {
        const filtered = [];
        const targets = [];
        render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
        targets.forEach((c) => c());
        render_callbacks = filtered;
    }
    const outroing = new Set();
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            flush_render_callbacks($$.after_update);
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.59.2' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation, has_stop_immediate_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        if (has_stop_immediate_propagation)
            modifiers.push('stopImmediatePropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/App.svelte generated by Svelte v3.59.2 */

    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let h1;
    	let t1;
    	let div3;
    	let h20;
    	let t3;
    	let h3;
    	let t5;
    	let div2;
    	let div1;
    	let div0;
    	let t6;
    	let div4;
    	let h21;
    	let t8;
    	let p0;
    	let t10;
    	let div5;
    	let h22;
    	let t12;
    	let p1;
    	let t14;
    	let label0;
    	let input0;
    	let span0;
    	let t16;
    	let div6;
    	let h23;
    	let t18;
    	let p2;
    	let t20;
    	let label1;
    	let input1;
    	let span1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = "animation generator";
    			t1 = space();
    			div3 = element("div");
    			h20 = element("h2");
    			h20.textContent = "アニメーション";
    			t3 = space();
    			h3 = element("h3");
    			h3.textContent = "プログレスバー";
    			t5 = space();
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			t6 = space();
    			div4 = element("div");
    			h21 = element("h2");
    			h21.textContent = "animation-name";
    			t8 = space();
    			p0 = element("p");
    			p0.textContent = "@keyframes で定義したアニメーション名を記述します";
    			t10 = space();
    			div5 = element("div");
    			h22 = element("h2");
    			h22.textContent = "animation-duration";
    			t12 = space();
    			p1 = element("p");
    			p1.textContent = "何秒かけてアニメーションを1回するか指定します";
    			t14 = space();
    			label0 = element("label");
    			input0 = element("input");
    			span0 = element("span");
    			span0.textContent = "秒";
    			t16 = space();
    			div6 = element("div");
    			h23 = element("h2");
    			h23.textContent = "animation-duration";
    			t18 = space();
    			p2 = element("p");
    			p2.textContent = "何秒かけてアニメーションを1回するか指定します";
    			t20 = space();
    			label1 = element("label");
    			input1 = element("input");
    			span1 = element("span");
    			span1.textContent = "秒";
    			attr_dev(h1, "class", "title svelte-ep9bg4");
    			add_location(h1, file, 17, 1, 571);
    			add_location(h20, file, 19, 2, 648);
    			add_location(h3, file, 20, 2, 667);
    			attr_dev(div0, "class", "progress-bar svelte-ep9bg4");
    			attr_dev(div0, "style", /*animationStyle*/ ctx[1]);
    			add_location(div0, file, 23, 4, 736);
    			attr_dev(div1, "class", "progress-bar-container svelte-ep9bg4");
    			add_location(div1, file, 22, 3, 695);
    			add_location(div2, file, 21, 2, 686);
    			attr_dev(div3, "class", "animation-viewer svelte-ep9bg4");
    			add_location(div3, file, 18, 1, 615);
    			add_location(h21, file, 28, 2, 841);
    			add_location(p0, file, 29, 2, 867);
    			attr_dev(div4, "class", "control1 svelte-ep9bg4");
    			add_location(div4, file, 27, 1, 816);
    			add_location(h22, file, 32, 2, 939);
    			add_location(p1, file, 33, 2, 969);
    			attr_dev(input0, "type", "number");
    			add_location(input0, file, 34, 10, 1010);
    			add_location(span0, file, 34, 33, 1033);
    			add_location(label0, file, 34, 2, 1002);
    			attr_dev(div5, "class", "control2 svelte-ep9bg4");
    			add_location(div5, file, 31, 1, 914);
    			add_location(h23, file, 37, 2, 1091);
    			add_location(p2, file, 38, 2, 1121);
    			attr_dev(input1, "class", "animation-duration-input svelte-ep9bg4");
    			attr_dev(input1, "type", "number");
    			attr_dev(input1, "min", "0.1");
    			attr_dev(input1, "step", "0.1");
    			add_location(input1, file, 40, 3, 1165);
    			add_location(span1, file, 46, 5, 1296);
    			add_location(label1, file, 39, 2, 1154);
    			attr_dev(div6, "class", "control2 svelte-ep9bg4");
    			add_location(div6, file, 36, 1, 1066);
    			attr_dev(main, "class", "svelte-ep9bg4");
    			add_location(main, file, 16, 0, 563);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(main, t1);
    			append_dev(main, div3);
    			append_dev(div3, h20);
    			append_dev(div3, t3);
    			append_dev(div3, h3);
    			append_dev(div3, t5);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(main, t6);
    			append_dev(main, div4);
    			append_dev(div4, h21);
    			append_dev(div4, t8);
    			append_dev(div4, p0);
    			append_dev(main, t10);
    			append_dev(main, div5);
    			append_dev(div5, h22);
    			append_dev(div5, t12);
    			append_dev(div5, p1);
    			append_dev(div5, t14);
    			append_dev(div5, label0);
    			append_dev(label0, input0);
    			append_dev(label0, span0);
    			append_dev(main, t16);
    			append_dev(main, div6);
    			append_dev(div6, h23);
    			append_dev(div6, t18);
    			append_dev(div6, p2);
    			append_dev(div6, t20);
    			append_dev(div6, label1);
    			append_dev(label1, input1);
    			set_input_value(input1, /*animationDuration*/ ctx[0]);
    			append_dev(label1, span1);

    			if (!mounted) {
    				dispose = listen_dev(input1, "input", /*input1_input_handler*/ ctx[2]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*animationStyle*/ 2) {
    				attr_dev(div0, "style", /*animationStyle*/ ctx[1]);
    			}

    			if (dirty & /*animationDuration*/ 1 && to_number(input1.value) !== /*animationDuration*/ ctx[0]) {
    				set_input_value(input1, /*animationDuration*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let animationDuration = 3;
    	let animationTimingFunction = "ease";
    	let animationDelay = 0;
    	let animationIerationCount = "infinite";
    	let animationDirection = "normal";
    	let animationFillMode = "forwards";
    	let animationStyle = "";
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function input1_input_handler() {
    		animationDuration = to_number(this.value);
    		$$invalidate(0, animationDuration);
    	}

    	$$self.$capture_state = () => ({
    		animationDuration,
    		animationTimingFunction,
    		animationDelay,
    		animationIerationCount,
    		animationDirection,
    		animationFillMode,
    		animationStyle
    	});

    	$$self.$inject_state = $$props => {
    		if ('animationDuration' in $$props) $$invalidate(0, animationDuration = $$props.animationDuration);
    		if ('animationTimingFunction' in $$props) $$invalidate(3, animationTimingFunction = $$props.animationTimingFunction);
    		if ('animationDelay' in $$props) $$invalidate(4, animationDelay = $$props.animationDelay);
    		if ('animationIerationCount' in $$props) $$invalidate(5, animationIerationCount = $$props.animationIerationCount);
    		if ('animationDirection' in $$props) $$invalidate(6, animationDirection = $$props.animationDirection);
    		if ('animationFillMode' in $$props) $$invalidate(7, animationFillMode = $$props.animationFillMode);
    		if ('animationStyle' in $$props) $$invalidate(1, animationStyle = $$props.animationStyle);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*animationDuration*/ 1) {
    			$$invalidate(1, animationStyle = `animation-duration: ${animationDuration}s;
		animation-timing-function: ${animationTimingFunction};
		animation-delay: ${animationDelay}s;
		animation-iteration-count: ${animationIerationCount};
		animation-direction: ${animationDirection};
		animation-fill-mode: ${animationFillMode};`);
    		}
    	};

    	return [animationDuration, animationStyle, input1_input_handler];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
